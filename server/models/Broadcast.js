const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    waAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsAppAccount', required: true },
    name: { type: String, required: true, trim: true },
    templateName: { type: String, required: true },
    templateLanguage: { type: String, default: 'en' },
    templateComponents: { type: mongoose.Schema.Types.Mixed, default: [] },
    recipients: {
      type: { type: String, enum: ['all', 'segment', 'tags', 'custom'], default: 'all' },
      segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', default: null },
      tags: [{ type: String }],
      contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
      count: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'failed', 'cancelled'],
      default: 'draft',
    },
    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      replied: { type: Number, default: 0 },
    },
    jobId: { type: String, default: null },
    errorLog: [{ message: String, timestamp: Date }],
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, default: null },
    estimatedTime: { type: Number, default: 0 }, // in minutes
  },
  { timestamps: true }
);

broadcastSchema.index({ userId: 1, createdAt: -1 });
broadcastSchema.index({ status: 1, scheduledAt: 1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
