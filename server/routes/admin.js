const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');

const requirePlatformAdmin = (req, res, next) => {
  if (!req.user.isPlatformAdmin) return error(res, 'Forbidden', 403);
  next();
};

// GET /api/admin/users — every organization owner (billing is per-organization)
router.get('/users', authenticate, requirePlatformAdmin, async (req, res) => {
  try {
    const owners = await User.find({ organizationId: null }).select('-password').sort({ createdAt: -1 });
    const now = new Date();

    const usersWithStatus = await Promise.all(owners.map(async (u) => {
      const activeSub = await Subscription.findOne({ userId: u._id, status: 'active', endDate: { $gt: now } }).sort({ endDate: -1 });
      const trialActive = u.trialEndsAt && now < new Date(u.trialEndsAt);
      let status = 'expired';
      if (activeSub) status = 'active';
      else if (trialActive) status = 'trial';

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        organizationName: u.organizationName,
        plan: u.plan,
        trialEndsAt: u.trialEndsAt,
        subscriptionEndsAt: activeSub?.endDate || null,
        status,
        createdAt: u.createdAt,
      };
    }));

    return success(res, { users: usersWithStatus });
  } catch (err) {
    console.error('Admin users fetch error:', err);
    return error(res, 'Failed to fetch users', 500);
  }
});

// POST /api/admin/users/:id/renew — manual 30-day renewal (no payment gateway yet)
router.post('/users/:id/renew', authenticate, requirePlatformAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const now = new Date();
    const existing = await Subscription.findOne({ userId: user._id, status: 'active', endDate: { $gt: now } }).sort({ endDate: -1 });
    const start = existing ? new Date(existing.endDate) : now;
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 30);

    let subscription;
    if (existing) {
      existing.endDate = endDate;
      existing.nextBillingDate = endDate;
      subscription = await existing.save();
    } else {
      subscription = await Subscription.create({
        userId: user._id,
        planId: null,
        planName: 'starter',
        billingCycle: 'monthly',
        status: 'active',
        amount: 999,
        currency: 'INR',
        startDate: now,
        endDate,
        nextBillingDate: endDate,
      });
    }

    await User.findByIdAndUpdate(user._id, { plan: 'starter' });

    const amount = 999;
    const tax = Math.round(amount * 0.18);
    await Invoice.create({
      userId: user._id,
      subscriptionId: subscription._id,
      amount,
      tax,
      totalAmount: amount + tax,
      currency: 'INR',
      status: 'paid',
      planName: 'starter',
      billingCycle: 'monthly',
      paidAt: now,
      billingAddress: { name: user.name, email: user.email },
      items: [{ description: 'Starter plan — 30 day renewal', quantity: 1, unitPrice: amount, total: amount }],
    });

    return success(res, { endDate }, 'Subscription renewed for 30 days');
  } catch (err) {
    console.error('Admin renew error:', err);
    return error(res, 'Failed to renew subscription', 500);
  }
});

module.exports = router;
