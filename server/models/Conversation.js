const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
    waAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsAppAccount', required: true },
    phoneNumber: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved', 'pending', 'bot'], default: 'open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastMessage: {
      text: { type: String, default: '' },
      type: { type: String, default: 'text' },
      timestamp: { type: Date, default: Date.now },
      fromContact: { type: Boolean, default: false },
    },
    unreadCount: { type: Number, default: 0 },
    labels: [{ type: String }],
    isArchived: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    windowExpiresAt: { type: Date, default: null }, // 24h messaging window
    notes: { type: String, default: '' },
    customAttributes: { type: Map, of: String, default: {} },
    flowActive: { type: Boolean, default: false },
    activeFlowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flow', default: null },
    activeFlowStep: { type: Number, default: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, status: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
