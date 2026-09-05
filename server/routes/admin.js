const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');
const { DEFAULT_PLANS } = require('../config/planLimits');

const RENEWABLE_PLANS = DEFAULT_PLANS.filter((p) => p.name !== 'free');

const requirePlatformAdmin = (req, res, next) => {
  if (!req.user.isPlatformAdmin) return error(res, 'Forbidden', 403);
  next();
};

// GET /api/admin/users — every organization owner (billing is per-organization)
router.get('/users', authenticate, requirePlatformAdmin, async (req, res) => {
  try {
    const now = new Date();
    const search = (req.query.search || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const query = { organizationId: null };
    if (search) {
      // Escaped so a stray "(" or "*" in the box can't throw or scan wildly.
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      query.$or = [{ email: rx }, { name: rx }, { organizationName: rx }];
    }

    const owners = await User.find(query)
      .select('name email organizationName plan trialEndsAt createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // One query for every owner on this page instead of one per owner —
    // the old per-user findOne meant 1001 round trips at 1000 customers.
    const activeSubs = await Subscription.find({
      userId: { $in: owners.map((u) => u._id) },
      status: 'active',
      endDate: { $gt: now },
    }).select('userId endDate').sort({ endDate: -1 }).lean();

    const subByUser = new Map();
    for (const sub of activeSubs) {
      const key = String(sub.userId);
      if (!subByUser.has(key)) subByUser.set(key, sub); // sorted desc, so first wins
    }

    const usersWithStatus = owners.map((u) => {
      const activeSub = subByUser.get(String(u._id));
      const trialActive = u.trialEndsAt && now < new Date(u.trialEndsAt);
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        organizationName: u.organizationName,
        plan: u.plan,
        trialEndsAt: u.trialEndsAt,
        subscriptionEndsAt: activeSub?.endDate || null,
        status: activeSub ? 'active' : trialActive ? 'trial' : 'expired',
        createdAt: u.createdAt,
      };
    });

    // Stats cover every customer, not just the page above, so they stay
    // correct once the list is capped or filtered by a search.
    const [totalOwners, paidUserIds, revenueAgg] = await Promise.all([
      User.countDocuments({ organizationId: null }),
      Subscription.distinct('userId', { status: 'active', endDate: { $gt: now } }),
      Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    // A user who renewed early can still have a future trialEndsAt, so count
    // them as active only — otherwise the buckets overlap and don't add up.
    const trialCount = await User.countDocuments({
      organizationId: null,
      trialEndsAt: { $gt: now },
      _id: { $nin: paidUserIds },
    });

    const stats = {
      total: totalOwners,
      active: paidUserIds.length,
      trial: trialCount,
      expired: Math.max(totalOwners - paidUserIds.length - trialCount, 0),
      totalRevenue: revenueAgg[0]?.total || 0,
    };

    return success(res, { users: usersWithStatus, stats, truncated: usersWithStatus.length >= limit });
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

    // Every renewal used to hardcode Starter/₹999 regardless of what plan
    // the admin actually meant to apply — a Growth or Enterprise customer
    // got silently downgraded to Starter (in both the invoice and
    // User.plan) on their very next renewal. Now the admin picks the plan.
    const { planName } = req.body;
    const plan = RENEWABLE_PLANS.find((p) => p.name === planName);
    if (!plan) {
      return error(res, `planName must be one of: ${RENEWABLE_PLANS.map((p) => p.name).join(', ')}`, 400);
    }

    const now = new Date();
    // Renewing early extends from the current period's end, not from today,
    // so paying ahead never costs the customer days they already paid for.
    const existing = await Subscription.findOne({ userId: user._id, status: 'active', endDate: { $gt: now } }).sort({ endDate: -1 });
    const start = existing ? new Date(existing.endDate) : now;
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 30);

    const amount = plan.price.monthly;

    let subscription;
    if (existing) {
      existing.planName = plan.name;
      existing.billingCycle = 'monthly';
      existing.amount = amount;
      existing.endDate = endDate;
      existing.nextBillingDate = endDate;
      subscription = await existing.save();
    } else {
      subscription = await Subscription.create({
        userId: user._id,
        planId: null,
        planName: plan.name,
        billingCycle: 'monthly',
        status: 'active',
        amount,
        currency: 'INR',
        startDate: now,
        endDate,
        nextBillingDate: endDate,
      });
    }

    await User.findByIdAndUpdate(user._id, { plan: plan.name });

    const tax = Math.round(amount * 0.18);
    await Invoice.create({
      userId: user._id,
      subscriptionId: subscription._id,
      amount,
      tax,
      totalAmount: amount + tax,
      currency: 'INR',
      status: 'paid',
      planName: plan.name,
      billingCycle: 'monthly',
      paidAt: now,
      billingAddress: { name: user.name, email: user.email },
      items: [{ description: `${plan.displayName} plan — 30 day renewal`, quantity: 1, unitPrice: amount, total: amount }],
    });

    return success(res, { endDate, planName: plan.name }, `Renewed on the ${plan.displayName} plan for 30 days`);
  } catch (err) {
    console.error('Admin renew error:', err);
    return error(res, 'Failed to renew subscription', 500);
  }
});

module.exports = router;
