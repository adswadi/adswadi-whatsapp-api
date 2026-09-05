const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Segment = require('../models/Segment');
const { authenticate } = require('../middleware/auth');
const { checkContactLimit } = require('../middleware/planLimits');
const { upload, handleUpload } = require('../middleware/upload');
const { success, error, paginated } = require('../utils/responseHelper');
const { normalizePhone } = require('../utils/phone');
const csv = require('csv-parser');
const { Readable } = require('stream');

// GET /api/contacts
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, tags, segment, optedIn } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (tags) query.tags = { $in: tags.split(',') };
    if (segment) query.segments = segment;
    if (optedIn !== undefined) query.optedIn = optedIn === 'true';

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('segments', 'name'),
      Contact.countDocuments(query),
    ]);

    return paginated(res, contacts, total, page, limit);
  } catch (err) {
    return error(res, 'Failed to fetch contacts', 500);
  }
});

// GET /api/contacts/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, optedIn, optedOut, blocked] = await Promise.all([
      Contact.countDocuments({ userId }),
      Contact.countDocuments({ userId, optedIn: true, optedOut: false }),
      Contact.countDocuments({ userId, optedOut: true }),
      Contact.countDocuments({ userId, isBlocked: true }),
    ]);
    return success(res, { total, optedIn, optedOut, blocked });
  } catch (err) {
    return error(res, 'Failed to fetch stats', 500);
  }
});

// GET /api/contacts/tags
router.get('/tags', authenticate, async (req, res) => {
  try {
    const tags = await Contact.distinct('tags', { userId: req.user._id });
    return success(res, { tags });
  } catch (err) {
    return error(res, 'Failed to fetch tags', 500);
  }
});

// GET /api/contacts/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('segments', 'name color')
      .populate('assignedTo', 'name avatar');
    if (!contact) return error(res, 'Contact not found', 404);
    return success(res, { contact });
  } catch (err) {
    return error(res, 'Failed to fetch contact', 500);
  }
});

// POST /api/contacts
router.post('/', authenticate, checkContactLimit, async (req, res) => {
  try {
    const { name, phone, email, tags, customFields, notes, source } = req.body;
    if (!name || !phone) return error(res, 'Name and phone are required', 400);

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return error(res, 'Phone number is not valid', 400);

    // Matching on the normalized number also stops "9304595002" and
    // "+91 93045 95002" from being saved as two separate contacts.
    const existing = await Contact.findOne({ userId: req.user._id, phone: normalizedPhone });
    if (existing) return error(res, 'Contact with this phone already exists', 409);

    const contact = await Contact.create({
      userId: req.user._id,
      name,
      phone: normalizedPhone,
      email,
      tags: tags || [],
      customFields: customFields || {},
      notes,
      source: source || 'manual',
    });

    return success(res, { contact }, 'Contact created', 201);
  } catch (err) {
    return error(res, 'Failed to create contact', 500);
  }
});

// PUT /api/contacts/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.userId;
    if (updates.phone !== undefined) {
      const normalizedPhone = normalizePhone(updates.phone);
      if (!normalizedPhone) return error(res, 'Phone number is not valid', 400);
      updates.phone = normalizedPhone;
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );
    if (!contact) return error(res, 'Contact not found', 404);
    return success(res, { contact });
  } catch (err) {
    return error(res, 'Failed to update contact', 500);
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) return error(res, 'Contact not found', 404);
    return success(res, {}, 'Contact deleted');
  } catch (err) {
    return error(res, 'Failed to delete contact', 500);
  }
});

// DELETE /api/contacts/bulk/delete
router.post('/bulk/delete', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return error(res, 'No contact IDs provided', 400);
    await Contact.deleteMany({ _id: { $in: ids }, userId: req.user._id });
    return success(res, {}, `${ids.length} contacts deleted`);
  } catch (err) {
    return error(res, 'Failed to delete contacts', 500);
  }
});

// POST /api/contacts/import
router.post('/import', authenticate, upload.single('file'), handleUpload, async (req, res) => {
  try {
    if (!req.file) return error(res, 'CSV file required', 400);

    const results = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(req.file.buffer.toString());
      stream
        .pipe(csv())
        .on('data', (row) => {
          const phone = normalizePhone(row.phone);
          if (phone && row.name) {
            results.push({
              userId: req.user._id,
              name: row.name?.trim(),
              phone,
              email: row.email?.trim() || '',
              tags: row.tags ? row.tags.split('|').map((t) => t.trim()) : [],
              source: 'import',
            });
          } else {
            errors.push(`Row missing name or valid phone: ${JSON.stringify(row)}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Bulk upsert
    let imported = 0;
    for (const data of results) {
      try {
        await Contact.updateOne(
          { userId: req.user._id, phone: data.phone },
          { $setOnInsert: data },
          { upsert: true }
        );
        imported++;
      } catch (e) {
        errors.push(`Failed to import ${data.phone}: ${e.message}`);
      }
    }

    return success(res, { imported, errors: errors.slice(0, 20), total: results.length }, 'Import complete');
  } catch (err) {
    console.error('Import error:', err);
    return error(res, 'Failed to import contacts', 500);
  }
});

// GET /api/contacts/export/csv
router.get('/export/csv', authenticate, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id }).lean();

    const headers = ['name', 'phone', 'email', 'tags', 'optedIn', 'createdAt'];
    const rows = contacts.map((c) => [
      c.name,
      c.phone,
      c.email || '',
      (c.tags || []).join('|'),
      c.optedIn ? 'yes' : 'no',
      new Date(c.createdAt).toISOString().split('T')[0],
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    return res.send(csv);
  } catch (err) {
    return error(res, 'Failed to export contacts', 500);
  }
});

module.exports = router;
