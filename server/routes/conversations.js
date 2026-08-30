const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Contact = require('../models/Contact');
const WhatsAppAccount = require('../models/WhatsAppAccount');
const whatsappService = require('../services/whatsappService');
const { authenticate } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscription');
const { upload, handleUpload } = require('../middleware/upload');
const { success, error, paginated } = require('../utils/responseHelper');

const RESOURCE_TYPE_TO_MESSAGE_TYPE = { image: 'image', video: 'video', audio: 'audio', raw: 'document' };

// GET /api/conversations
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 30, status, assignedTo, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id, isArchived: false };
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ 'lastMessage.timestamp': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('contactId', 'name phone avatar tags')
        .populate('assignedTo', 'name avatar')
        .populate('waAccountId', 'displayName phoneNumber'),
      Conversation.countDocuments(query),
    ]);

    return paginated(res, conversations, total, page, limit);
  } catch (err) {
    return error(res, 'Failed to fetch conversations', 500);
  }
});

// GET /api/conversations/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const [open, pending, resolved, unreadTotal] = await Promise.all([
      Conversation.countDocuments({ userId, status: 'open' }),
      Conversation.countDocuments({ userId, status: 'pending' }),
      Conversation.countDocuments({ userId, status: 'resolved' }),
      Conversation.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$unreadCount' } } },
      ]),
    ]);

    return success(res, {
      open,
      pending,
      resolved,
      unread: unreadTotal[0]?.total || 0,
    });
  } catch (err) {
    return error(res, 'Failed to fetch stats', 500);
  }
});

// GET /api/conversations/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('contactId', 'name phone email avatar tags customFields notes')
      .populate('assignedTo', 'name avatar email')
      .populate('waAccountId', 'displayName phoneNumber');

    if (!conversation) return error(res, 'Conversation not found', 404);
    return success(res, { conversation });
  } catch (err) {
    return error(res, 'Failed to fetch conversation', 500);
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!conversation) return error(res, 'Conversation not found', 404);

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('sentBy', 'name avatar'),
      Message.countDocuments({ conversationId: conversation._id }),
    ]);

    // Reset unread count
    await Conversation.findByIdAndUpdate(conversation._id, { unreadCount: 0 });

    return paginated(res, messages.reverse(), total, page, limit);
  } catch (err) {
    return error(res, 'Failed to fetch messages', 500);
  }
});

// POST /api/conversations/:id/messages
// POST /api/conversations/:id/upload — upload an attachment, returns a URL + WhatsApp message type
router.post('/:id/upload', authenticate, requireActiveSubscription, upload.single('file'), handleUpload, async (req, res) => {
  try {
    if (!req.uploadedFile) return error(res, 'No file uploaded', 400);
    const type = RESOURCE_TYPE_TO_MESSAGE_TYPE[req.uploadedFile.type] || 'document';
    return success(res, { url: req.uploadedFile.url, type, fileName: req.file?.originalname });
  } catch (err) {
    console.error('Conversation upload error:', err);
    return error(res, 'Failed to upload file', 500);
  }
});

router.post('/:id/messages', authenticate, requireActiveSubscription, async (req, res) => {
  try {
    const { type = 'text', text, mediaUrl, templateName, templateLanguage, components } = req.body;

    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('waAccountId');

    if (!conversation) return error(res, 'Conversation not found', 404);

    // A conversation is linked to whichever WhatsApp account was active when
    // it was first created (from the incoming webhook) and never updated
    // after that — if the user later reconnects/replaces their number, old
    // conversations keep sending through the stale, no-longer-active
    // account. Always resolve to whatever's active *now* instead, and heal
    // the conversation's stored reference so this doesn't need to repeat.
    let waAccount = conversation.waAccountId;
    const currentActive = await WhatsAppAccount.findOne({ userId: req.user._id, isActive: true }).sort({ updatedAt: -1 });
    if (currentActive && String(currentActive._id) !== String(waAccount?._id)) {
      waAccount = currentActive;
      await Conversation.findByIdAndUpdate(conversation._id, { waAccountId: currentActive._id });
    }
    if (!waAccount) return error(res, 'WhatsApp account not found', 404);

    let result;
    if (type === 'template') {
      result = await whatsappService.sendTemplateMessage(waAccount, conversation.phoneNumber, templateName, templateLanguage, components);
    } else if (['image', 'video', 'audio', 'document'].includes(type)) {
      result = await whatsappService.sendMediaMessage(waAccount, conversation.phoneNumber, type, mediaUrl);
    } else {
      result = await whatsappService.sendTextMessage(waAccount, conversation.phoneNumber, text);
    }

    const message = await Message.create({
      conversationId: conversation._id,
      userId: req.user._id,
      waMessageId: result.messages?.[0]?.id || null,
      direction: 'outbound',
      from: waAccount.phoneNumber,
      to: conversation.phoneNumber,
      type,
      content: {
        text: text || '',
        mediaUrl: mediaUrl || null,
        templateName: templateName || null,
      },
      status: 'sent',
      statusTimestamps: { sent: new Date() },
      sentBy: req.user._id,
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: {
        text: text || `[${type}]`,
        type,
        timestamp: new Date(),
        fromContact: false,
      },
      status: 'open',
    });

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user._id}`).emit('new_message', {
        conversationId: conversation._id,
        message,
      });
    }

    return success(res, { message }, 'Message sent', 201);
  } catch (err) {
    console.error('Send message error:', err?.response?.data || err.message);
    return error(res, err?.response?.data?.error?.message || 'Failed to send message', 500);
  }
});

// PUT /api/conversations/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, assignedTo, labels, notes, isArchived } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (labels) updates.labels = labels;
    if (notes !== undefined) updates.notes = notes;
    if (isArchived !== undefined) updates.isArchived = isArchived;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    ).populate('contactId', 'name phone avatar');

    if (!conversation) return error(res, 'Conversation not found', 404);

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user._id}`).emit('conversation_updated', { conversation });
    }

    return success(res, { conversation });
  } catch (err) {
    return error(res, 'Failed to update conversation', 500);
  }
});

module.exports = router;
