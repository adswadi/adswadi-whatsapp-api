const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    planName: { type: String, required: true },
    billingCycle: { type: String, default: 'monthly' },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paidAt: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    billingAddress: {
      name: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      gstin: String,
    },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
