const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    waMessageId: { type: String, default: null }, // Meta's message ID
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contacts', 'template', 'interactive', 'reaction', 'system'],
      default: 'text',
    },
    content: {
      text: { type: String, default: '' },
      caption: { type: String, default: '' },
      mediaUrl: { type: String, default: null },
      mediaId: { type: String, default: null },
      mimeType: { type: String, default: null },
      fileName: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      templateName: { type: String, default: null },
      templateData: { type: mongoose.Schema.Types.Mixed, default: null },
      interactiveType: { type: String, default: null },
      interactiveData: { type: mongoose.Schema.Types.Mixed, default: null },
      reactionEmoji: { type: String, default: null },
      reactionToMessageId: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    statusTimestamps: {
      sent: { type: Date, default: null },
      delivered: { type: Date, default: null },
      read: { type: Date, default: null },
      failed: { type: Date, default: null },
    },
    errorCode: { type: String, default: null },
    errorMessage: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    broadcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Broadcast', default: null },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ waMessageId: 1 });
// Analytics and dashboard counters filter by user over a date range.
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ broadcastId: 1 });

module.exports = mongoose.model('Message', messageSchema);
