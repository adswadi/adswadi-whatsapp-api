import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import useAuthStore from '@/store/authStore'

const TrialBanner = () => {
  const { user } = useAuthStore()

  if (!user?.trialEndsAt || user.plan !== 'free') return null

  const now = new Date()
  const end = new Date(user.trialEndsAt)
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

  if (daysLeft > 3) return null

  const expired = daysLeft <= 0

  return (
    <div className={expired ? 'bg-red-50 border-b border-red-100' : 'bg-amber-50 border-b border-amber-100'}>
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle size={15} className={expired ? 'text-red-500' : 'text-amber-500'} />
          <span className={expired ? 'text-red-700' : 'text-amber-700'}>
            {expired
              ? 'Your free trial has ended — messages and campaigns are paused until you renew.'
              : `Your free trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`}
          </span>
        </div>
        <Link to="/billing" className="text-sm font-semibold text-brand-purple hover:underline shrink-0">
          Renew now — ₹999 + GST/mo
        </Link>
      </div>
    </div>
  )
}

export default TrialBanner
