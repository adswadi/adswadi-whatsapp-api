import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Shield, RefreshCw, Users, CheckCircle2, Clock, XCircle, IndianRupee, Search } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  trial: { variant: 'blue', label: 'Trial' },
  active: { variant: 'green', label: 'Active' },
  expired: { variant: 'red', label: 'Expired' },
}

const AdminPage = () => {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [renewingId, setRenewingId] = useState(null)
  const [search, setSearch] = useState('')
  const [truncated, setTruncated] = useState(false)

  // Searching server-side rather than filtering the loaded page — the API
  // returns the newest 100 organizations, so a client-side filter would only
  // ever look at those and quietly miss the rest as the customer list grows.
  const fetchUsers = async (searchTerm = search) => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: searchTerm.trim() ? { search: searchTerm.trim() } : {} })
      setUsers(res.data.data.users || [])
      setStats(res.data.data.stats || null)
      setTruncated(!!res.data.data.truncated)
    } catch (_) {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user?.isPlatformAdmin) return
    const t = setTimeout(() => fetchUsers(search), search ? 350 : 0)
    return () => clearTimeout(t)
  }, [user, search])

  if (user && !user.isPlatformAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const renew = async (id) => {
    setRenewingId(id)
    try {
      await api.post(`/admin/users/${id}/renew`)
      toast.success('Renewed for 30 days')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew')
    }
    setRenewingId(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center">
          <Shield size={20} className="text-brand-purple" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-jakarta">Admin — Customers</h2>
          <p className="text-sm text-gray-500">Manage trial and subscription status for every organization</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats?.total ?? '—', icon: Users, color: 'text-gray-500 bg-gray-100' },
          { label: 'Active', value: stats?.active ?? '—', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Trial', value: stats?.trial ?? '—', icon: Clock, color: 'text-blue-600 bg-blue-50' },
          { label: 'Expired', value: stats?.expired ?? '—', icon: XCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Revenue', value: stats ? formatCurrency(stats.totalRevenue) : '—', icon: IndianRupee, color: 'text-brand-purple bg-brand-purple/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon size={16} />
              </div>
              <p className="text-lg font-extrabold text-gray-900 font-jakarta">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <CardTitle>
            {search
              ? `${users.length} match${users.length === 1 ? '' : 'es'}`
              : `${users.length} of ${stats?.total ?? users.length} organizations`}
            {truncated && <span className="ml-2 text-xs font-normal text-gray-400">— search to find the rest</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} />}
              className="w-64"
            />
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => fetchUsers()} loading={loading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl skeleton" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              {search ? 'No matching organizations' : 'No organizations yet'}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map((u) => {
                const badge = STATUS_BADGE[u.status] || STATUS_BADGE.expired
                return (
                  <div key={u._id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{u.organizationName || u.name}</p>
                      <p className="text-xs text-gray-500">{u.name} • {u.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {u.status === 'trial' && u.trialEndsAt && `Trial ends ${formatDate(u.trialEndsAt)}`}
                        {u.status === 'active' && u.subscriptionEndsAt && `Renews ${formatDate(u.subscriptionEndsAt)}`}
                        {u.status === 'expired' && 'No active access'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={badge.variant} dot>{badge.label}</Badge>
                      <Button
                        variant="gradient"
                        size="sm"
                        loading={renewingId === u._id}
                        onClick={() => renew(u._id)}
                      >
                        Renew +30 days
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPage
