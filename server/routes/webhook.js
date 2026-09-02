const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const WhatsAppAccount = require('../models/WhatsAppAccount');
const Contact = require('../models/Contact');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Broadcast = require('../models/Broadcast');
const { processIncomingMessage } = require('../services/flowEngine');
const whatsappService = require('../services/whatsappService');
const { uploadToCloudinary } = require('../middleware/upload');
const { decrypt } = require('../utils/encryption');

const MEDIA_TYPES = ['image', 'video', 'audio', 'document', 'sticker'];

// GET /api/webhook/whatsapp - Webhook verification
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ error: 'Verification failed' });
});

// POST /api/webhook/whatsapp - Incoming messages
router.post('/whatsapp', async (req, res) => {
  try {
    // Verify signature — must be computed against the exact raw bytes Meta
    // sent, not a re-serialized JSON.stringify(req.body), which almost never
    // matches byte-for-byte (key order, unicode escaping, etc.) and would
    // reject every real webhook with a 403.
    const signature = req.headers['x-hub-signature-256'];
    if (signature && process.env.META_APP_SECRET) {
      const expectedSig = 'sha256=' + crypto
        .createHmac('sha256', process.env.META_APP_SECRET)
        .update(req.rawBody || Buffer.from(JSON.stringify(req.body)))
        .digest('hex');
      if (signature !== expectedSig) {
        return res.status(403).json({ error: 'Invalid signature' });
      }
    }

    res.status(200).json({ status: 'ok' }); // Respond immediately

    const entry = req.body.entry?.[0];
    if (!entry) return;

    const changes = entry.changes;
    for (const change of changes) {
      if (change.field !== 'messages') continue;

      const value = change.value;
      const phoneNumberId = value.metadata?.phone_number_id;

      // Find WA account by phoneNumberId
      const waAccount = await WhatsAppAccount.findOne({ phoneNumberId });
      if (!waAccount) continue;

      // Handle status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await handleStatusUpdate(status, waAccount._id);
        }
      }

      // Handle incoming messages
      if (value.messages) {
        for (const msg of value.messages) {
          await handleIncomingMessage(msg, waAccount, value.contacts?.[0]);
        }
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }
});

const handleStatusUpdate = async (statusData, waAccountId) => {
  try {
    const { id, status, timestamp, errors } = statusData;

    const message = await Message.findOneAndUpdate(
      { waMessageId: id },
      {
        status,
        [`statusTimestamps.${status}`]: new Date(parseInt(timestamp) * 1000),
        ...(errors && { errorCode: errors[0]?.code?.toString(), errorMessage: errors[0]?.title }),
      },
      { new: true }
    );

    if (message?.broadcastId) {
      const incField = `stats.${status}`;
      await Broadcast.findByIdAndUpdate(message.broadcastId, { $inc: { [incField]: 1 } });
    }

    // Emit status update via socket
    if (global.io) {
      global.io.emit('message_status', { messageId: id, status });
    }
  } catch (err) {
    console.error('Status update error:', err.message);
  }
};

const handleIncomingMessage = async (msgData, waAccount, contactData) => {
  try {
    const from = msgData.from;
    const contactName = contactData?.profile?.name || from;

    // Find or create contact
    let contact = await Contact.findOne({ userId: waAccount.userId, phone: from });
    if (!contact) {
      contact = await Contact.create({
        userId: waAccount.userId,
        name: contactName,
        phone: from,
        source: 'whatsapp',
        waProfileName: contactName,
      });
    } else {
      await Contact.findByIdAndUpdate(contact._id, {
        waProfileName: contactName,
        lastMessageAt: new Date(),
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ userId: waAccount.userId, phoneNumber: from });
    const isNewConversation = !conversation;
    if (!conversation) {
      conversation = await Conversation.create({
        userId: waAccount.userId,
        contactId: contact._id,
        waAccountId: waAccount._id,
        phoneNumber: from,
        windowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } else {
      await Conversation.findByIdAndUpdate(conversation._id, {
        windowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        $inc: { unreadCount: 1 },
      });
    }

    // Parse message content
    const content = parseMessageContent(msgData);

    // Meta's media URL expires and needs an auth header, so the dashboard
    // can't load it directly — pull the bytes now and re-host on Cloudinary.
    if (MEDIA_TYPES.includes(msgData.type) && content.mediaId) {
      try {
        const token = decrypt(waAccount.accessToken);
        const { buffer, mimeType } = await whatsappService.downloadMedia(content.mediaId, token);
        const result = await uploadToCloudinary(buffer, {
          resource_type: msgData.type === 'video' ? 'video' : msgData.type === 'audio' ? 'video' : 'auto',
        });
        content.mediaUrl = result.secure_url;
        if (!content.mimeType) content.mimeType = mimeType;
      } catch (mediaErr) {
        console.error('Incoming media download/upload error:', mediaErr.message);
      }
    }

    // Save message
    const message = await Message.create({
      conversationId: conversation._id,
      userId: waAccount.userId,
      waMessageId: msgData.id,
      direction: 'inbound',
      from,
      to: waAccount.phoneNumber,
      type: msgData.type,
      content,
      status: 'delivered',
      statusTimestamps: { delivered: new Date() },
    });

    // Update conversation last message
    const lastMsgText = content.text || `[${msgData.type}]`;
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: {
        text: lastMsgText,
        type: msgData.type,
        timestamp: new Date(),
        fromContact: true,
      },
      status: 'open',
    });

    // Update contact stats
    await Contact.findByIdAndUpdate(contact._id, {
      lastSeen: new Date(),
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 },
    });

    // Emit via socket
    if (global.io) {
      global.io.to(`user_${waAccount.userId}`).emit('new_message', {
        conversationId: conversation._id,
        message,
        contact,
      });
    }

    // Process flow engine
    await processIncomingMessage(waAccount.userId, message, conversation, isNewConversation);

    // Mark as read
    // await whatsappService.markMessageRead(waAccount, msgData.id);
  } catch (err) {
    console.error('Incoming message error:', err.message);
  }
};

const parseMessageContent = (msg) => {
  const content = {};

  switch (msg.type) {
    case 'text':
      content.text = msg.text?.body || '';
      break;
    case 'image':
      content.mediaId = msg.image?.id;
      content.mimeType = msg.image?.mime_type;
      content.caption = msg.image?.caption || '';
      break;
    case 'video':
      content.mediaId = msg.video?.id;
      content.mimeType = msg.video?.mime_type;
      content.caption = msg.video?.caption || '';
      break;
    case 'audio':
      content.mediaId = msg.audio?.id;
      content.mimeType = msg.audio?.mime_type;
      break;
    case 'document':
      content.mediaId = msg.document?.id;
      content.mimeType = msg.document?.mime_type;
      content.fileName = msg.document?.filename;
      content.caption = msg.document?.caption || '';
      break;
    case 'location':
      content.latitude = msg.location?.latitude;
      content.longitude = msg.location?.longitude;
      content.text = `Location: ${msg.location?.name || ''}`;
      break;
    case 'interactive':
      content.interactiveType = msg.interactive?.type;
      content.interactiveData = msg.interactive;
      content.text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
      break;
    case 'reaction':
      content.reactionEmoji = msg.reaction?.emoji;
      content.reactionToMessageId = msg.reaction?.message_id;
      content.text = `Reacted with ${msg.reaction?.emoji}`;
      break;
    default:
      content.text = `[${msg.type}]`;
  }

  return content;
};

// POST /api/webhook/razorpay - Razorpay webhook
router.post('/razorpay', async (req, res) => {
  try {
    // Same fix as the WhatsApp webhook above: hash the exact raw bytes
    // Razorpay signed, not a re-serialized copy that rarely matches byte-for-byte.
    const signature = req.headers['x-razorpay-signature'];
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody || Buffer.from(JSON.stringify(req.body)))
      .digest('hex');

    if (signature !== expectedSig) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    console.log('Razorpay webhook event:', event);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay webhook error:', err.message);
    res.status(500).json({ error: 'Webhook error' });
  }
});

module.exports = router;
