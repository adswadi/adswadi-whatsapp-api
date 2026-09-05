const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Shared by the route-blocking middleware below and GET /billing/status,
// so a customer's trial/subscription is judged the same way whether we're
// deciding to reject a send or telling the dashboard whether to show the
// renew popup up front.
const getSubscriptionStatus = async (user) => {
  // The platform admin manages every customer's billing from here — they
  // must never be blocked by their own trial/subscription state while doing
  // that, on whichever account they're signed in as.
  if (user.isPlatformAdmin) return { active: true };

  const isOwner = !user.organizationId;
  const billingOwnerId = isOwner ? user._id : user.organizationId;
  const owner = isOwner ? user : await User.findById(billingOwnerId);

  if (!owner) {
    return { active: false, message: 'Account not found' };
  }

  const now = new Date();
  if (owner.trialEndsAt && now < new Date(owner.trialEndsAt)) {
    return { active: true };
  }

  const activeSub = await Subscription.findOne({
    userId: billingOwnerId,
    status: 'active',
    endDate: { $gt: now },
  });
  if (activeSub) return { active: true };

  return {
    active: false,
    message: 'Your trial has ended. Renew your plan (₹999 + 18% GST/month) to keep sending messages.',
  };
};

// Blocks message-sending routes once a user's (or their organization owner's)
// trial and any paid subscription have both lapsed. Team members bill under
// their organization owner, not themselves.
const requireActiveSubscription = async (req, res, next) => {
  try {
    const status = await getSubscriptionStatus(req.user);
    if (status.active) return next();
    return res.status(402).json({ success: false, code: 'SUBSCRIPTION_EXPIRED', message: status.message });
  } catch (err) {
    console.error('Subscription check error:', err);
    return res.status(500).json({ success: false, message: 'Subscription check failed' });
  }
};

module.exports = { requireActiveSubscription, getSubscriptionStatus };
