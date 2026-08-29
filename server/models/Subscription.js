const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Optional: manual admin renewals and the current Razorpay flow both
    // create subscriptions without a real Plan document reference.
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    planName: { type: String, required: true },
    billingCycle: { type: String, enum: ['monthly', 'annual'], default: 'monthly' },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
      default: 'active',
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    nextBillingDate: { type: Date, default: null },
    razorpaySubscriptionId: { type: String, default: null },
    razorpayCustomerId: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
