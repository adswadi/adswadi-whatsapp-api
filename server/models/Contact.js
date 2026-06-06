const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true },
    avatar: { type: String, default: null },
    tags: [{ type: String, trim: true }],
    segments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
    customFields: { type: Map, of: String, default: {} },
    optedIn: { type: Boolean, default: true },
    optedOut: { type: Boolean, default: false },
    optedOutAt: { type: Date, default: null },
    language: { type: String, default: 'en' },
    country: { type: String, default: 'IN' },
    source: { type: String, enum: ['manual', 'import', 'api', 'form', 'whatsapp'], default: 'manual' },
    lastSeen: { type: Date, default: null },
    lastMessageAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
    waProfileName: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

contactSchema.index({ userId: 1, phone: 1 }, { unique: true });
contactSchema.index({ userId: 1, tags: 1 });
contactSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
