import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import useSubscriptionStore from '@/store/subscriptionStore'

const SubscriptionExpiredModal = () => {
  const { expiredModalOpen, expiredMessage, hideExpiredModal } = useSubscriptionStore()
  const navigate = useNavigate()

  if (!expiredModalOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={hideExpiredModal}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 font-jakarta mb-2">
          Your trial has ended
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {expiredMessage || 'Renew your plan to keep sending WhatsApp messages and campaigns.'}
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-gray-900 font-jakarta">₹999</span>
            <span className="text-sm text-gray-500">+ 18% GST / month</span>
          </div>
        </div>

        <button
          onClick={() => { hideExpiredModal(); navigate('/billing') }}
          className="w-full rounded-xl py-3 font-semibold text-white"
          style={{ background: 'linear-gradient(90deg, #7B2FBE, #4A6CF7)' }}
        >
          Go to Billing
        </button>
      </div>
    </div>
  )
}

export default SubscriptionExpiredModal
