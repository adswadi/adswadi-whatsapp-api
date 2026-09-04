import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare, Users, Megaphone, BarChart2, Receipt,
  ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import StatCard from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDateTime, formatNumber, cn } from '@/lib/utils'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const [overview, setOverview] = useState(null)
  const [chartData, setChartData] = useState([])
  const [broadcasts, setBroadcasts] = useState([])
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovRes, chartRes, bcastRes, invRes] = await Promise.all([
          api.get('/analytics/overview?period=30d'),
          api.get('/analytics/messages-chart?period=30d'),
          api.get('/broadcasts?limit=5'),
          api.get('/billing/invoices'),
        ])
        setOverview(ovRes.data.data)
        setChartData(chartRes.data.data.chart || [])
        setBroadcasts(bcastRes.data.data || [])
        setInvoiceCount((invRes.data.data.invoices || []).length)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const quickActions = [
    { label: 'New Campaign', path: '/campaigns', icon: Megaphone, color: 'purple' },
    { label: 'View Inbox', path: '/inbox', icon: MessageSquare, color: 'blue' },
    { label: 'Import Contacts', path: '/contacts', icon: Users, color: 'pink' },
    { label: 'View Analytics', path: '/analytics', icon: BarChart2, color: 'green' },
  ]

  const statusMap = {
    completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    running: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    scheduled: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    draft: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50' },
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your WhatsApp marketing today.</p>
        </div>
        <div className="hidden sm:block">
          <span className="plan-badge capitalize">{user?.plan} Plan</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Contacts"
          value={overview?.contacts?.total || 0}
          change={overview?.contacts?.new > 0 ? Math.round((overview.contacts.new / Math.max(overview.contacts.total - overview.contacts.new, 1)) * 100) : 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Messages (30d)"
          value={overview?.messages?.total || 0}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Broadcasts (30d)"
          value={overview?.broadcasts?.total || 0}
          icon={Megaphone}
          color="pink"
        />
        <StatCard
          title="Delivery Rate"
          value={`${overview?.broadcasts?.deliveryRate || 0}%`}
          change={overview?.broadcasts?.deliveryRate > 0 ? 2.3 : undefined}
          icon={TrendingUp}
          color="green"
        />
        <Link to="/billing" className="block w-full h-full">
          <StatCard
            title="Invoices"
            value={invoiceCount}
            icon={Receipt}
            color="purple"
            className="w-full h-full hover:border-brand-purple/30 transition-colors cursor-pointer"
          />
        </Link>
      </div>

      {/* Charts + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B2FBE" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7B2FBE" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="outbound" stroke="#7B2FBE" strokeWidth={2} fill="url(#colorOut)" name="Sent" />
                  <Area type="monotone" dataKey="inbound" stroke="#25D366" strokeWidth={2} fill="url(#colorIn)" name="Received" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 size={36} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No message data yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map(({ label, path, icon: Icon, color }) => (
              <Link key={path} to={path}>
                <div className={cn(
                  'flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer border border-transparent hover:border-gray-100'
                )}>
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    color === 'purple' && 'bg-brand-purple/10 text-brand-purple',
                    color === 'blue' && 'bg-brand-blue/10 text-brand-blue',
                    color === 'pink' && 'bg-brand-pink/10 text-brand-pink',
                    color === 'green' && 'bg-whatsapp/10 text-whatsapp',
                  )}>
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 flex-1">{label}</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Broadcast stats + Recent broadcasts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Broadcast performance */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Sent', value: overview?.broadcasts?.sent || 0, color: '#7B2FBE' },
              { label: 'Delivered', value: overview?.broadcasts?.delivered || 0, color: '#4A6CF7' },
              { label: 'Read', value: overview?.broadcasts?.read || 0, color: '#25D366' },
              { label: 'Failed', value: overview?.broadcasts?.failed || 0, color: '#ef4444' },
            ].map(({ label, value, color }) => {
              const total = overview?.broadcasts?.sent || 1
              const pct = Math.round((value / total) * 100)
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">{formatNumber(value)} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent broadcasts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Broadcasts</CardTitle>
            <Link to="/campaigns" className="text-sm text-brand-purple font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {broadcasts.length === 0 ? (
              <div className="py-10 text-center">
                <Megaphone size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No broadcasts yet</p>
                <Link to="/campaigns">
                  <p className="text-sm text-brand-purple font-semibold mt-1 hover:underline">Create your first campaign</p>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {broadcasts.map((b) => {
                  const StatusIcon = statusMap[b.status]?.icon || AlertCircle
                  return (
                    <div key={b._id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className={cn('p-2 rounded-lg', statusMap[b.status]?.bg)}>
                        <StatusIcon size={16} className={statusMap[b.status]?.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                        <p className="text-xs text-gray-500">{b.templateName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(b.stats?.sent || 0)} sent</p>
                        <p className="text-xs text-gray-400">{formatDateTime(b.createdAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA for free plan */}
      {user?.plan === 'free' && (
        <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, #1A0A2E, #2D1B4E)' }}>
          <div>
            <p className="text-white font-bold font-jakarta text-lg">Unlock unlimited power 🚀</p>
            <p className="text-white/60 text-sm mt-1">Upgrade to Starter for 5,000 contacts, 50 broadcasts/month, and team access.</p>
          </div>
          <Link to="/billing">
            <button className="btn-gradient whitespace-nowrap">Upgrade Now</button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
