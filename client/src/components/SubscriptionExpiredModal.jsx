import { Sparkles, Check } from 'lucide-react'
import useSubscriptionStore from '@/store/subscriptionStore'

const PLANS = [
  {
    name: 'Starter',
    price: '999',
    features: ['5,000 contacts', '50 broadcasts/month', '2 WhatsApp numbers'],
  },
  {
    name: 'Growth',
    price: '2,999',
    popular: true,
    features: ['25,000 contacts', '200 broadcasts/month', '5 WhatsApp numbers'],
  },
]

// Deliberately not dismissible — there's no live payment gateway yet, so
// this is purely informational for now. Renewal itself still happens
// manually (customer reaches out, pays, we activate from the admin panel).
const SubscriptionExpiredModal = () => {
  const { expiredModalOpen } = useSubscriptionStore()

  if (!expiredModalOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={26} className="text-brand-purple" />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-2">
          Don't keep your customers waiting!
        </h2>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          Your messages are paused right now. Upgrade to keep every conversation, broadcast, and automation running — pick the plan that fits your business.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-5 text-left relative ${plan.popular ? 'border-brand-purple' : 'border-gray-100'}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ background: 'linear-gradient(90deg, #7B2FBE, #4A6CF7)' }}>
                  Most Popular
                </span>
              )}
              <p className="font-bold text-gray-900 font-jakarta">{plan.name}</p>
              <p className="mb-3">
                <span className="text-2xl font-extrabold text-gray-900 font-jakarta">₹{plan.price}</span>
                <span className="text-xs text-gray-500"> + GST/mo</span>
              </p>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Check size={12} className="text-brand-purple shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Reach out to your Adswadi account manager to upgrade — your account is activated the moment payment is confirmed.
        </p>
      </div>
    </div>
  )
}

export default SubscriptionExpiredModal
