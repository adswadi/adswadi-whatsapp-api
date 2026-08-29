const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// GET /api/billing/plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
    if (plans.length === 0) {
      // Return default plans if none in DB
      return success(res, {
        plans: [
          {
            name: 'free',
            displayName: 'Free',
            description: 'Perfect for getting started',
            price: { monthly: 0, annual: 0 },
            currency: 'INR',
            limits: { contacts: 500, broadcasts_per_month: 5, team_members: 1, whatsapp_accounts: 1, flows: 3 },
            features: ['500 contacts', '5 broadcasts/month', '1 WhatsApp number', '3 automation flows', 'Basic analytics'],
            isMostPopular: false,
          },
          {
            name: 'starter',
            displayName: 'Starter',
            description: 'For growing businesses',
            price: { monthly: 999, annual: 9990 },
            currency: 'INR',
            limits: { contacts: 5000, broadcasts_per_month: 50, team_members: 3, whatsapp_accounts: 2, flows: 20 },
            features: ['5,000 contacts', '50 broadcasts/month', '2 WhatsApp numbers', '20 automation flows', 'Team inbox (3 agents)', 'Advanced analytics', 'Priority support'],
            isMostPopular: false,
          },
          {
            name: 'growth',
            displayName: 'Growth',
            description: 'For scaling teams',
            price: { monthly: 2999, annual: 29990 },
            currency: 'INR',
            limits: { contacts: 25000, broadcasts_per_month: 200, team_members: 10, whatsapp_accounts: 5, flows: 100 },
            features: ['25,000 contacts', '200 broadcasts/month', '5 WhatsApp numbers', '100 automation flows', 'Team inbox (10 agents)', 'Full analytics', 'API access', 'Dedicated support'],
            isMostPopular: true,
          },
          {
            name: 'enterprise',
            displayName: 'Enterprise',
            description: 'For large organizations',
            price: { monthly: 9999, annual: 99990 },
            currency: 'INR',
            limits: { contacts: -1, broadcasts_per_month: -1, team_members: -1, whatsapp_accounts: -1, flows: -1 },
            features: ['Unlimited contacts', 'Unlimited broadcasts', 'Unlimited numbers', 'Unlimited flows', 'Unlimited agents', 'White-label option', 'SLA guarantee', '24/7 support'],
            isMostPopular: false,
          },
        ],
      });
    }
    return success(res, { plans });
  } catch (err) {
    return error(res, 'Failed to fetch plans', 500);
  }
});

// GET /api/billing/subscription
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id, status: 'active' })
      .populate('planId');
    return success(res, { subscription, plan: req.user.plan });
  } catch (err) {
    return error(res, 'Failed to fetch subscription', 500);
  }
});

// GET /api/billing/invoices
router.get('/invoices', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return success(res, { invoices });
  } catch (err) {
    return error(res, 'Failed to fetch invoices', 500);
  }
});

// GET /api/billing/invoices/:id/download
router.get('/invoices/:id/download', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return error(res, 'Invoice not found', 404);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; max-width: 640px; margin: 40px auto; padding: 0 20px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #7B2FBE; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 22px; font-weight: 800; background: linear-gradient(90deg, #7B2FBE, #4A6CF7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .meta { text-align: right; font-size: 13px; color: #666; }
          .status { display: inline-block; background: #22c55e; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { text-align: left; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 1px solid #eee; padding: 8px 0; }
          td { padding: 12px 0; border-bottom: 1px solid #f3f3f3; font-size: 14px; }
          .totals { margin-left: auto; width: 260px; }
          .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .totals .grand { font-weight: 800; font-size: 17px; border-top: 2px solid #1a1a1a; padding-top: 10px; margin-top: 6px; }
          .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Adswadi WhatsApp API</div>
            <p style="font-size: 13px; color: #666; margin-top: 4px;">Adswadi<br>adswadiofficial@gmail.com</p>
          </div>
          <div class="meta">
            <div><strong>${invoice.invoiceNumber}</strong></div>
            <div>${new Date(invoice.paidAt || invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div class="status">${invoice.status.toUpperCase()}</div>
          </div>
        </div>

        <p style="font-size: 13px; color: #666;">Billed to</p>
        <p style="font-size: 15px; font-weight: 600;">${invoice.billingAddress?.name || req.user.name}<br>${invoice.billingAddress?.email || req.user.email}</p>

        <table>
          <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>
            ${(invoice.items || []).map((item) => `
              <tr><td>${item.description}</td><td style="text-align:right">₹${item.total.toLocaleString('en-IN')}</td></tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><span>₹${invoice.amount.toLocaleString('en-IN')}</span></div>
          <div><span>GST (18%)</span><span>₹${invoice.tax.toLocaleString('en-IN')}</span></div>
          <div class="grand"><span>Total</span><span>₹${invoice.totalAmount.toLocaleString('en-IN')}</span></div>
        </div>

        <div class="footer">This is a computer-generated invoice from Adswadi WhatsApp API.</div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.html"`);
    return res.send(html);
  } catch (err) {
    console.error('Invoice download error:', err);
    return error(res, 'Failed to generate invoice', 500);
  }
});

// POST /api/billing/create-order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { planName, billingCycle } = req.body;

    const PRICES = {
      starter: { monthly: 99900, annual: 999000 },
      growth: { monthly: 299900, annual: 2999000 },
      enterprise: { monthly: 999900, annual: 9999000 },
    };

    const price = PRICES[planName]?.[billingCycle];
    if (!price) return error(res, 'Invalid plan or billing cycle', 400);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: price,
      currency: 'INR',
      receipt: `rcpt_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        planName,
        billingCycle,
      },
    });

    // Create pending invoice
    const invoice = await Invoice.create({
      userId: req.user._id,
      amount: price / 100,
      tax: Math.round((price / 100) * 0.18),
      totalAmount: Math.round(price / 100 * 1.18),
      currency: 'INR',
      status: 'pending',
      planName,
      billingCycle,
      razorpayOrderId: order.id,
      items: [{ description: `${planName} plan (${billingCycle})`, quantity: 1, unitPrice: price / 100, total: price / 100 }],
    });

    return success(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      invoiceId: invoice._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return error(res, 'Failed to create payment order', 500);
  }
});

// POST /api/billing/verify-payment
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, billingCycle, invoiceId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return error(res, 'Payment verification failed', 400);
    }

    // Update invoice
    await Invoice.findByIdAndUpdate(invoiceId, {
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    });

    // Calculate subscription end date
    const now = new Date();
    const endDate = new Date(now);
    if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Cancel existing subscription
    await Subscription.updateMany({ userId: req.user._id, status: 'active' }, { status: 'cancelled' });

    // Create new subscription
    await Subscription.create({
      userId: req.user._id,
      planId: null,
      planName,
      billingCycle,
      status: 'active',
      amount: 0,
      currency: 'INR',
      startDate: now,
      endDate,
      nextBillingDate: endDate,
      razorpaySubscriptionId: razorpay_payment_id,
    });

    // Upgrade user plan
    await User.findByIdAndUpdate(req.user._id, { plan: planName });

    return success(res, {}, 'Payment verified and plan upgraded');
  } catch (err) {
    console.error('Verify payment error:', err);
    return error(res, 'Failed to verify payment', 500);
  }
});

// POST /api/billing/cancel
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    await Subscription.findOneAndUpdate(
      { userId: req.user._id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason || '', autoRenew: false }
    );
    return success(res, {}, 'Subscription cancellation scheduled');
  } catch (err) {
    return error(res, 'Failed to cancel subscription', 500);
  }
});

module.exports = router;
