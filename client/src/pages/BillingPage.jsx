import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, ArrowRight, Download, Zap } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const BillingPage = () => {
  const { user, fetchMe } = useAuthStore()
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [plansRes, subRes, invRes] = await Promise.all([
          api.get('/billing/plans'),
          api.get('/billing/subscription'),
          api.get('/billing/invoices'),
        ])
        setPlans(plansRes.data.data.plans || [])
        setSubscription(subRes.data.data.subscription)
        setInvoices(invRes.data.data.invoices || [])
      } catch (_) {}
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleUpgrade = async (planName) => {
    setPayLoading(planName)
    try {
      const res = await api.post('/billing/create-order', { planName, billingCycle })
      const { orderId, amount, currency, invoiceId, key } = res.data.data

      const options = {
        key,
        amount,
        currency,
        name: 'Adswadi WhatsApp API',
        description: `${planName} Plan (${billingCycle})`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/billing/verify-payment', {
              ...response,
              planName,
              billingCycle,
              invoiceId,
            })
            toast.success(`Successfully upgraded to ${planName} plan!`)
            await fetchMe()
            const invRes = await api.get('/billing/invoices')
            setInvoices(invRes.data.data.invoices || [])
            const subRes = await api.get('/billing/subscription')
            setSubscription(subRes.data.data.subscription)
          } catch (_) {
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#7B2FBE' },
        modal: { ondismiss: () => setPayLoading(null) },
      }

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        // Load Razorpay script dynamically
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          const rzp = new window.Razorpay(options)
          rzp.open()
        }
        document.body.appendChild(script)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setPayLoading(null)
    }
  }

  const PLAN_COLORS = {
    free: 'border-gray-200',
    starter: 'border-brand-blue',
    growth: 'border-brand-purple shadow-xl shadow-brand-purple/10',
    enterprise: 'border-brand-pink',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-jakarta">Billing & Plans</h2>
        <p className="text-sm text-gray-500">Manage your subscription and payment history</p>
      </div>

      {/* Current plan info */}
      {subscription && (
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B2FBE20, #4A6CF720)' }}>
                <CreditCard size={22} className="text-brand-purple" />
              </div>
              <div>
                <p className="font-bold text-gray-900 font-jakarta capitalize">{subscription.planName} Plan</p>
                <p className="text-sm text-gray-500">
                  {subscription.billingCycle} billing • Renews {formatDate(subscription.endDate)}
                </p>
              </div>
            </div>
            <Badge variant="green" dot>Active</Badge>
          </CardContent>
        </Card>
      )}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn('text-sm font-semibold', billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400')}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            billingCycle === 'annual' ? 'bg-brand-purple' : 'bg-gray-200'
          )}
        >
          <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0.5')} />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400')}>Annual</span>
          <Badge variant="green" className="text-[10px]">Save 20%</Badge>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-gray-100 rounded-2xl skeleton" />
          ))
        ) : (
          plans.map((plan) => {
            const price = plan.price?.[billingCycle] || 0
            const isCurrent = user?.plan === plan.name
            const isPopular = plan.isMostPopular

            return (
              <div
                key={plan.name}
                className={cn('bg-white rounded-2xl border-2 p-5 relative flex flex-col', PLAN_COLORS[plan.name] || 'border-gray-200')}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ background: 'linear-gradient(90deg, #7B2FBE, #4A6CF7)' }}>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-bold text-gray-900 font-jakarta text-lg">{plan.displayName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-extrabold text-gray-900 font-jakarta">
                    {price === 0 ? '₹0' : formatCurrency(price)}
                  </span>
                  <span className="text-sm text-gray-500">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                </div>

                <ul className="space-y-2 mb-5 flex-1">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-brand-purple shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : plan.name === 'free' ? (
                  <Button variant="ghost" className="w-full border border-gray-200" disabled>
                    Free Forever
                  </Button>
                ) : (
                  <Button
                    variant={isPopular ? 'gradient' : 'outline'}
                    className="w-full"
                    loading={payLoading === plan.name}
                    onClick={() => handleUpgrade(plan.name)}
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="py-10 text-center">
              <CreditCard size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No payment history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center">
                      <CreditCard size={16} className="text-brand-purple" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm capitalize">{inv.planName} Plan</p>
                      <p className="text-xs text-gray-500">{inv.invoiceNumber} • {formatDate(inv.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{formatCurrency(inv.totalAmount)}</p>
                      <Badge variant={inv.status === 'paid' ? 'green' : inv.status === 'failed' ? 'red' : 'yellow'} dot className="text-[10px]">
                        {inv.status}
                      </Badge>
                    </div>
                    {inv.status === 'paid' && (
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                        <Download size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BillingPage
