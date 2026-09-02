import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { formatCurrency, cn } from '@/lib/utils'

const PLAN_COLORS = {
  free: 'border-gray-200',
  starter: 'border-brand-blue',
  growth: 'border-brand-purple shadow-xl shadow-brand-purple/10',
  enterprise: 'border-brand-pink',
}

const PricingPage = () => {
  const [plans, setPlans] = useState([])
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/billing/plans')
      .then((res) => setPlans(res.data.data.plans || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <MarketingLayout>
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-4 text-center">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Pricing</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">Start free for 7 days. No credit card required. Upgrade whenever you're ready to scale.</p>
      </div>

      <div className="flex items-center justify-center gap-4 py-10">
        <span className={cn('text-sm font-semibold', billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400')}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className={cn('relative w-12 h-6 rounded-full transition-colors', billingCycle === 'annual' ? 'bg-brand-purple' : 'bg-gray-200')}
        >
          <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0.5')} />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400')}>Annual</span>
          <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Save 20%</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />)
          ) : (
            plans.map((plan) => {
              const price = plan.price?.[billingCycle] || 0
              const isPopular = plan.isMostPopular
              return (
                <div key={plan.name} className={cn('bg-white rounded-2xl border-2 p-5 relative flex flex-col', PLAN_COLORS[plan.name] || 'border-gray-200')}>
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ background: 'linear-gradient(90deg,#7B2FBE,#4A6CF7)' }}>Most Popular</span>
                    </div>
                  )}
                  <p className="font-bold text-gray-900 text-lg">{plan.displayName}</p>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">{plan.description}</p>
                  <div className="mb-5">
                    <span className="text-3xl font-extrabold text-gray-900">{price === 0 ? '₹0' : formatCurrency(price)}</span>
                    <span className="text-sm text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                    {price > 0 && <p className="text-xs text-gray-400 mt-1">+18% GST</p>}
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {(plan.features || []).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-brand-purple shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={cn(
                      'w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-transform hover:scale-105',
                      isPopular ? 'text-white' : 'border border-gray-200 text-gray-700 hover:border-gray-300'
                    )}
                    style={isPopular ? { background: 'linear-gradient(90deg,#7B2FBE,#4A6CF7)' } : {}}
                  >
                    Start Free Trial
                  </Link>
                </div>
              )
            })
          )}
        </div>
        <p className="text-center text-sm text-gray-400 mt-10">
          Every plan starts with a 7-day free trial. Renewals are handled manually by our team — reach out anytime at{' '}
          <a href="mailto:adswadiofficial@gmail.com" className="text-brand-purple font-semibold">adswadiofficial@gmail.com</a>.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="text-white rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg,#1A0A2E,#3B1560)' }}>
          <h2 className="text-2xl font-bold mb-2">Still deciding?</h2>
          <p className="text-gray-300 mb-6">Try every feature free for 7 days — no credit card needed.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </MarketingLayout>
  )
}

export default PricingPage
