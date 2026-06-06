import { useEffect, useState } from 'react'
import { BarChart2, TrendingUp, Users, MessageSquare, Megaphone, RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Button from '@/components/ui/Button'
import { formatNumber, cn } from '@/lib/utils'

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
]

const PIE_COLORS = ['#7B2FBE', '#4A6CF7', '#E91E8C', '#25D366']

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d')
  const [overview, setOverview] = useState(null)
  const [msgChart, setMsgChart] = useState([])
  const [contactChart, setContactChart] = useState([])
  const [broadcastPerf, setBroadcastPerf] = useState([])
  const [topTags, setTopTags] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [ovRes, msgRes, conRes, bcastRes, tagRes] = await Promise.all([
        api.get(`/analytics/overview?period=${period}`),
        api.get(`/analytics/messages-chart?period=${period}`),
        api.get(`/analytics/contacts-growth?period=${period}`),
        api.get('/analytics/broadcast-performance'),
        api.get('/analytics/top-tags'),
      ])
      setOverview(ovRes.data.data)
      setMsgChart(msgRes.data.data.chart || [])
      setContactChart(conRes.data.data.chart || [])
      setBroadcastPerf(bcastRes.data.data.broadcasts || [])
      setTopTags(tagRes.data.data.tags || [])
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [period])

  const pieData = overview ? [
    { name: 'Sent', value: overview.broadcasts?.sent || 0 },
    { name: 'Delivered', value: overview.broadcasts?.delivered || 0 },
    { name: 'Read', value: overview.broadcasts?.read || 0 },
    { name: 'Failed', value: overview.broadcasts?.failed || 0 },
  ] : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-jakarta">Analytics</h2>
          <p className="text-sm text-gray-500">Track your WhatsApp marketing performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  period === value ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={fetchAll} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Contacts" value={overview?.contacts?.total || 0} icon={Users} color="purple" change={overview?.contacts?.new > 0 ? 5 : undefined} />
        <StatCard title="New Contacts" value={overview?.contacts?.new || 0} icon={TrendingUp} color="blue" />
        <StatCard title="Messages Sent" value={overview?.messages?.outbound || 0} icon={MessageSquare} color="pink" />
        <StatCard title="Messages Received" value={overview?.messages?.inbound || 0} icon={MessageSquare} color="green" />
      </div>

      {/* Broadcast stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Broadcasts', value: overview?.broadcasts?.total || 0, color: 'text-brand-purple' },
          { label: 'Delivery Rate', value: `${overview?.broadcasts?.deliveryRate || 0}%`, color: 'text-brand-blue' },
          { label: 'Read Rate', value: `${overview?.broadcasts?.readRate || 0}%`, color: 'text-whatsapp' },
          { label: 'Failed', value: overview?.broadcasts?.failed || 0, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <p className={`text-2xl font-extrabold font-jakarta ${color}`}>{typeof value === 'number' ? formatNumber(value) : value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={msgChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B2FBE" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7B2FBE" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D366" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="outbound" stroke="#7B2FBE" strokeWidth={2} fill="url(#gOut)" name="Sent" />
                <Area type="monotone" dataKey="inbound" stroke="#25D366" strokeWidth={2} fill="url(#gIn)" name="Received" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Broadcast pie */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center">
                <p className="text-sm text-gray-400">No broadcast data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact growth */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contactChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#7B2FBE" radius={[4, 4, 0, 0]} name="New Contacts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top tags */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contact Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTags.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center">
                <p className="text-sm text-gray-400">No tag data yet</p>
              </div>
            ) : (
              topTags.slice(0, 8).map(({ tag, count }, i) => {
                const maxCount = topTags[0]?.count || 1
                const pct = Math.round((count / maxCount) * 100)
                return (
                  <div key={tag}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">#{tag}</span>
                      <span className="text-gray-500">{formatNumber(count)} contacts</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent broadcast performance */}
      {broadcastPerf.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Broadcast Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {broadcastPerf.map((b) => {
                const total = b.stats?.total || 1
                const delivRate = Math.round(((b.stats?.delivered || 0) / total) * 100)
                const readRate = Math.round(((b.stats?.read || 0) / total) * 100)
                return (
                  <div key={b._id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>{formatNumber(b.stats?.sent || 0)} sent</span>
                        <span className="text-green-600">{delivRate}% delivered</span>
                        <span className="text-brand-purple">{readRate}% read</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full relative overflow-hidden">
                      <div className="absolute h-full bg-brand-blue/30 rounded-full" style={{ width: `${delivRate}%` }} />
                      <div className="absolute h-full bg-brand-purple rounded-full" style={{ width: `${readRate}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AnalyticsPage
