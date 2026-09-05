const Bull = require('bull');
const Broadcast = require('../models/Broadcast');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const WhatsAppAccount = require('../models/WhatsAppAccount');
const whatsappService = require('../services/whatsappService');
const { normalizePhone } = require('../utils/phone');

const broadcastQueue = new Bull('broadcast', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

const DELAY_BETWEEN_MESSAGES = 1000; // 1 second to avoid rate limits

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

broadcastQueue.process('send-broadcast', 5, async (job) => {
  const { broadcastId, userId } = job.data;

  const broadcast = await Broadcast.findById(broadcastId);
  if (!broadcast || broadcast.status === 'cancelled') {
    return { skipped: true };
  }

  // If the account this broadcast was queued against got deactivated by a
  // reconnect in the meantime, send through whichever account is active now
  // instead of hard-failing the whole broadcast.
  let waAccount = await WhatsAppAccount.findById(broadcast.waAccountId);
  if (!waAccount || !waAccount.isActive) {
    waAccount = await WhatsAppAccount.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
  }
  if (!waAccount) {
    await Broadcast.findByIdAndUpdate(broadcastId, {
      status: 'failed',
      completedAt: new Date(),
      $push: { errorLog: { message: 'WhatsApp account not found or inactive', timestamp: new Date() } },
    });
    throw new Error('WhatsApp account not found or inactive');
  }

  // Build recipient list
  let contacts = [];
  const recipientConfig = broadcast.recipients;

  if (recipientConfig.type === 'all') {
    contacts = await Contact.find({ userId, optedIn: true, optedOut: false, isBlocked: false });
  } else if (recipientConfig.type === 'segment' && recipientConfig.segmentId) {
    contacts = await Contact.find({
      userId,
      segments: recipientConfig.segmentId,
      optedIn: true,
      optedOut: false,
      isBlocked: false,
    });
  } else if (recipientConfig.type === 'tags' && recipientConfig.tags?.length > 0) {
    contacts = await Contact.find({
      userId,
      tags: { $in: recipientConfig.tags },
      optedIn: true,
      optedOut: false,
      isBlocked: false,
    });
  } else if (recipientConfig.type === 'custom' && recipientConfig.contactIds?.length > 0) {
    contacts = await Contact.find({
      _id: { $in: recipientConfig.contactIds },
      optedIn: true,
      optedOut: false,
      isBlocked: false,
    });
  }

  await Broadcast.findByIdAndUpdate(broadcastId, {
    status: 'running',
    startedAt: new Date(),
    'stats.total': contacts.length,
    'recipients.count': contacts.length,
  });

  let sent = 0, failed = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    // Check for cancellation
    const currentBroadcast = await Broadcast.findById(broadcastId).select('status');
    if (currentBroadcast?.status === 'cancelled') break;

    // Contacts saved before phone normalization existed (or edited straight
    // in the database) can still hold a local-format number. Meta accepts a
    // send to one of those and returns a message id — it just never
    // delivers — so normalize here too rather than only at import time.
    const phone = normalizePhone(contact.phone) || contact.phone;

    try {
      const result = await whatsappService.sendTemplateMessage(
        waAccount,
        phone,
        broadcast.templateName,
        broadcast.templateLanguage,
        broadcast.templateComponents
      );

      // Find or create conversation
      let conversation = await Conversation.findOne({ userId, phoneNumber: phone });
      if (!conversation) {
        conversation = await Conversation.create({
          userId,
          contactId: contact._id,
          waAccountId: waAccount._id,
          phoneNumber: phone,
        });
      }

      // Save message record
      await Message.create({
        conversationId: conversation._id,
        userId,
        waMessageId: result.messages?.[0]?.id || null,
        direction: 'outbound',
        from: waAccount.phoneNumber,
        to: phone,
        type: 'template',
        content: {
          templateName: broadcast.templateName,
          templateData: broadcast.templateComponents,
        },
        status: 'sent',
        statusTimestamps: { sent: new Date() },
        broadcastId: broadcast._id,
      });

      sent++;
      await Broadcast.findByIdAndUpdate(broadcastId, { $inc: { 'stats.sent': 1 } });
    } catch (err) {
      failed++;
      console.error(`Broadcast send failed for ${phone}:`, err?.response?.data?.error?.message || err.message);
      await Broadcast.findByIdAndUpdate(broadcastId, {
        $inc: { 'stats.failed': 1 },
        $push: { errorLog: { message: `Failed for ${phone}: ${err?.response?.data?.error?.message || err.message}`, timestamp: new Date() } },
      });
    }

    // Progress update
    job.progress(Math.round(((i + 1) / contacts.length) * 100));

    if (i < contacts.length - 1) {
      await sleep(DELAY_BETWEEN_MESSAGES);
    }
  }

  await Broadcast.findByIdAndUpdate(broadcastId, {
    status: 'completed',
    completedAt: new Date(),
  });

  return { sent, failed, total: contacts.length };
});

// Bull surfaces Redis connection trouble as an 'error' event. With no
// listener attached that is an unhandled EventEmitter error, which takes the
// whole API process down — a Redis blip would knock every customer offline
// instead of just pausing broadcasts.
broadcastQueue.on('error', (err) => {
  console.error('Broadcast queue error (broadcasts paused, API unaffected):', err.message);
});

broadcastQueue.on('completed', (job, result) => {
  console.log(`Broadcast job ${job.id} completed:`, result);
});

broadcastQueue.on('failed', (job, err) => {
  console.error(`Broadcast job ${job.id} failed:`, err.message);
  Broadcast.findByIdAndUpdate(job.data.broadcastId, {
    status: 'failed',
    completedAt: new Date(),
  }).catch(console.error);
});

const addBroadcastJob = async (broadcastId, userId, delay = 0) => {
  const job = await broadcastQueue.add(
    'send-broadcast',
    { broadcastId, userId },
    { delay }
  );
  return job.id;
};

module.exports = { broadcastQueue, addBroadcastJob };
