import { AlertTriangle, Mail } from 'lucide-react'
import useSubscriptionStore from '@/store/subscriptionStore'

// Deliberately not dismissible and no self-serve payment button — there's no
// live payment gateway yet, so renewal is manual: the customer contacts us,
// pays, and we activate their account from the admin panel.
const SubscriptionExpiredModal = () => {
  const { expiredModalOpen } = useSubscriptionStore()

  if (!expiredModalOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 font-jakarta mb-2">
          Your Adswadi WhatsApp API plan has expired
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Switch to the Starter plan to start sending messages again. Contact us to renew — we'll activate your account as soon as payment is received.
        </p>

        <a
          href="mailto:adswadiofficial@gmail.com?subject=Renew%20my%20Adswadi%20WhatsApp%20API%20plan"
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
          style={{ background: 'linear-gradient(90deg, #7B2FBE, #4A6CF7)' }}
        >
          <Mail size={16} />
          Contact Us to Renew
        </a>
      </div>
    </div>
  )
}

export default SubscriptionExpiredModal
