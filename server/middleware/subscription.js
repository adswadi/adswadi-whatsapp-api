const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Blocks message-sending routes once a user's (or their organization owner's)
// trial and any paid subscription have both lapsed. Team members bill under
// their organization owner, not themselves.
const requireActiveSubscription = async (req, res, next) => {
  try {
    const isOwner = !req.user.organizationId;
    const billingOwnerId = isOwner ? req.user._id : req.user.organizationId;
    const owner = isOwner ? req.user : await User.findById(billingOwnerId);

    if (!owner) {
      return res.status(402).json({ success: false, code: 'SUBSCRIPTION_EXPIRED', message: 'Account not found' });
    }

    const now = new Date();
    if (owner.trialEndsAt && now < new Date(owner.trialEndsAt)) {
      return next();
    }

    const activeSub = await Subscription.findOne({
      userId: billingOwnerId,
      status: 'active',
      endDate: { $gt: now },
    });
    if (activeSub) return next();

    return res.status(402).json({
      success: false,
      code: 'SUBSCRIPTION_EXPIRED',
      message: 'Your trial has ended. Renew your plan (₹999 + 18% GST/month) to keep sending messages.',
    });
  } catch (err) {
    console.error('Subscription check error:', err);
    return res.status(500).json({ success: false, message: 'Subscription check failed' });
  }
};

module.exports = { requireActiveSubscription };
