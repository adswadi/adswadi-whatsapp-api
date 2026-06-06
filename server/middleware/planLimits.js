const Contact = require('../models/Contact');
const Broadcast = require('../models/Broadcast');
const { error } = require('../utils/responseHelper');

const PLAN_LIMITS = {
  free: {
    contacts: 500,
    broadcasts_per_month: 5,
    team_members: 1,
    whatsapp_accounts: 1,
    flows: 3,
  },
  starter: {
    contacts: 5000,
    broadcasts_per_month: 50,
    team_members: 3,
    whatsapp_accounts: 2,
    flows: 20,
  },
  growth: {
    contacts: 25000,
    broadcasts_per_month: 200,
    team_members: 10,
    whatsapp_accounts: 5,
    flows: 100,
  },
  enterprise: {
    contacts: Infinity,
    broadcasts_per_month: Infinity,
    team_members: Infinity,
    whatsapp_accounts: Infinity,
    flows: Infinity,
  },
};

const checkContactLimit = async (req, res, next) => {
  try {
    const plan = req.user.plan || 'free';
    const limit = PLAN_LIMITS[plan]?.contacts || 500;

    if (limit === Infinity) return next();

    const count = await Contact.countDocuments({ userId: req.user._id });
    if (count >= limit) {
      return error(res, `Contact limit reached for your plan (${limit}). Please upgrade.`, 403);
    }
    next();
  } catch (err) {
    next(err);
  }
};

const checkBroadcastLimit = async (req, res, next) => {
  try {
    const plan = req.user.plan || 'free';
    const limit = PLAN_LIMITS[plan]?.broadcasts_per_month || 5;

    if (limit === Infinity) return next();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await Broadcast.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: startOfMonth },
    });

    if (count >= limit) {
      return error(res, `Broadcast limit reached for this month (${limit}). Please upgrade.`, 403);
    }
    next();
  } catch (err) {
    next(err);
  }
};

const getPlanLimits = (plan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

module.exports = { checkContactLimit, checkBroadcastLimit, getPlanLimits, PLAN_LIMITS };
