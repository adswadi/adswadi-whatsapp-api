const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    description: { type: String, default: '' },
    price: {
      monthly: { type: Number, required: true },
      annual: { type: Number, required: true },
    },
    currency: { type: String, default: 'INR' },
    features: [{ type: String }],
    limits: {
      contacts: { type: Number, default: 500 },
      broadcasts_per_month: { type: Number, default: 5 },
      team_members: { type: Number, default: 1 },
      whatsapp_accounts: { type: Number, default: 1 },
      flows: { type: Number, default: 3 },
    },
    razorpayPlanId: {
      monthly: { type: String, default: null },
      annual: { type: String, default: null },
    },
    isActive: { type: Boolean, default: true },
    isMostPopular: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
