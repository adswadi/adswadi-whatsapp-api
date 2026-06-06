const express = require('express');
const router = express.Router();
const Broadcast = require('../models/Broadcast');
const { authenticate } = require('../middleware/auth');
const { checkBroadcastLimit } = require('../middleware/planLimits');
const { success, error, paginated } = require('../utils/responseHelper');
const { addBroadcastJob, broadcastQueue } = require('../workers/broadcastWorker');

// GET /api/broadcasts
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const [broadcasts, total] = await Promise.all([
      Broadcast.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('waAccountId', 'displayName phoneNumber'),
      Broadcast.countDocuments(query),
    ]);

    return paginated(res, broadcasts, total, page, limit);
  } catch (err) {
    return error(res, 'Failed to fetch broadcasts', 500);
  }
});

// GET /api/broadcasts/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('waAccountId', 'displayName phoneNumber');
    if (!broadcast) return error(res, 'Broadcast not found', 404);
    return success(res, { broadcast });
  } catch (err) {
    return error(res, 'Failed to fetch broadcast', 500);
  }
});

// POST /api/broadcasts
router.post('/', authenticate, checkBroadcastLimit, async (req, res) => {
  try {
    const {
      name, waAccountId, templateName, templateLanguage, templateComponents,
      recipients, scheduledAt, mediaUrl, mediaType,
    } = req.body;

    if (!name || !waAccountId || !templateName) {
      return error(res, 'Name, account, and template are required', 400);
    }

    const broadcast = await Broadcast.create({
      userId: req.user._id,
      name,
      waAccountId,
      templateName,
      templateLanguage: templateLanguage || 'en',
      templateComponents: templateComponents || [],
      recipients: recipients || { type: 'all', count: 0 },
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      mediaUrl,
      mediaType,
    });

    return success(res, { broadcast }, 'Broadcast created', 201);
  } catch (err) {
    console.error('Create broadcast error:', err);
    return error(res, 'Failed to create broadcast', 500);
  }
});

// PUT /api/broadcasts/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOne({ _id: req.params.id, userId: req.user._id });
    if (!broadcast) return error(res, 'Broadcast not found', 404);
    if (['running', 'completed'].includes(broadcast.status)) {
      return error(res, 'Cannot edit a running or completed broadcast', 400);
    }

    const updates = req.body;
    delete updates.userId;
    delete updates.stats;

    const updated = await Broadcast.findByIdAndUpdate(req.params.id, updates, { new: true });
    return success(res, { broadcast: updated });
  } catch (err) {
    return error(res, 'Failed to update broadcast', 500);
  }
});

// POST /api/broadcasts/:id/send
router.post('/:id/send', authenticate, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOne({ _id: req.params.id, userId: req.user._id });
    if (!broadcast) return error(res, 'Broadcast not found', 404);
    if (broadcast.status === 'running') return error(res, 'Broadcast already running', 400);
    if (broadcast.status === 'completed') return error(res, 'Broadcast already completed', 400);

    let delay = 0;
    if (broadcast.scheduledAt && broadcast.scheduledAt > new Date()) {
      delay = broadcast.scheduledAt - new Date();
    }

    const jobId = await addBroadcastJob(broadcast._id.toString(), req.user._id.toString(), delay);

    await Broadcast.findByIdAndUpdate(broadcast._id, {
      jobId: jobId.toString(),
      status: delay > 0 ? 'scheduled' : 'running',
    });

    return success(res, { jobId }, 'Broadcast queued');
  } catch (err) {
    console.error('Send broadcast error:', err);
    return error(res, 'Failed to queue broadcast', 500);
  }
});

// POST /api/broadcasts/:id/cancel
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!broadcast) return error(res, 'Broadcast not found', 404);

    if (broadcast.jobId) {
      try {
        const job = await broadcastQueue.getJob(broadcast.jobId);
        if (job) await job.remove();
      } catch (_) {}
    }

    return success(res, { broadcast }, 'Broadcast cancelled');
  } catch (err) {
    return error(res, 'Failed to cancel broadcast', 500);
  }
});

// DELETE /api/broadcasts/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!broadcast) return error(res, 'Broadcast not found', 404);
    return success(res, {}, 'Broadcast deleted');
  } catch (err) {
    return error(res, 'Failed to delete broadcast', 500);
  }
});

// GET /api/broadcasts/:id/progress
router.get('/:id/progress', authenticate, async (req, res) => {
  try {
    const broadcast = await Broadcast.findOne({ _id: req.params.id, userId: req.user._id }).select('stats status jobId');
    if (!broadcast) return error(res, 'Broadcast not found', 404);

    let progress = 0;
    if (broadcast.jobId) {
      try {
        const job = await broadcastQueue.getJob(broadcast.jobId);
        if (job) progress = await job.progress();
      } catch (_) {}
    }

    return success(res, { stats: broadcast.stats, status: broadcast.status, progress });
  } catch (err) {
    return error(res, 'Failed to fetch progress', 500);
  }
});

module.exports = router;
