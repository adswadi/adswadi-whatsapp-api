import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Shield, RefreshCw } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  trial: { variant: 'blue', label: 'Trial' },
  active: { variant: 'green', label: 'Active' },
  expired: { variant: 'red', label: 'Expired' },
}

const AdminPage = () => {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [renewingId, setRenewingId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.data.users || [])
    } catch (_) {
      toast.error('Failed to load users')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (user?.isPlatformAdmin) fetchUsers()
  }, [user])

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

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{users.length} organizations</CardTitle>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={fetchUsers} loading={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl skeleton" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No organizations yet</div>
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
