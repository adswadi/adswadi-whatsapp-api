const Plan = require('../models/Plan');

// Single source of truth for what each plan includes. Used as the fallback
// for GET /billing/plans when no Plan documents exist yet, and by anything
// in the app that needs to enforce a limit (team seats, contacts, etc.) —
// previously this list only lived inline in the pricing route, so nothing
// else could actually check against it.
const DEFAULT_PLANS = [
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
];

// -1 means unlimited throughout `limits`.
const getPlanLimits = async (planName) => {
  const dbPlan = await Plan.findOne({ name: planName, isActive: true }).lean();
  if (dbPlan) return dbPlan.limits;
  const fallback = DEFAULT_PLANS.find((p) => p.name === planName) || DEFAULT_PLANS[0];
  return fallback.limits;
};

module.exports = { DEFAULT_PLANS, getPlanLimits };
