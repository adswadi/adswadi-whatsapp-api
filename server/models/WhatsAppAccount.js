const mongoose = require('mongoose');

const whatsAppAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    phoneNumberId: { type: String, required: true },
    wabaId: { type: String, required: true },
    accessToken: { type: String, required: true }, // encrypted
    businessName: { type: String, default: '' },
    businessDescription: { type: String, default: '' },
    profilePicture: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    webhookVerified: { type: Boolean, default: false },
    qualityRating: { type: String, enum: ['GREEN', 'YELLOW', 'RED', 'UNKNOWN'], default: 'UNKNOWN' },
    messagingLimit: { type: String, default: 'TIER_1K' },
    stats: {
      totalSent: { type: Number, default: 0 },
      totalDelivered: { type: Number, default: 0 },
      totalRead: { type: Number, default: 0 },
      totalFailed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Every inbound webhook looks the account up by phoneNumberId, and every
// send resolves the user's active account — both are collection scans
// without these.
whatsAppAccountSchema.index({ phoneNumberId: 1 });
whatsAppAccountSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

module.exports = mongoose.model('WhatsAppAccount', whatsAppAccountSchema);
