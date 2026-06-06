import { useEffect, useState } from 'react'
import { Plus, Megaphone, Search, Filter, Play, Pause, Trash2, Eye, BarChart2 } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import CreateCampaignWizard from '@/components/campaigns/CreateCampaignWizard'
import { formatDateTime, formatNumber, getStatusColor, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const CampaignsPage = () => {
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const fetchBroadcasts = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await api.get(`/broadcasts?${params}`)
      setBroadcasts(res.data.data || [])
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBroadcasts() }, [statusFilter])

  const handleSend = async (id) => {
    try {
      await api.post(`/broadcasts/${id}/send`)
      toast.success('Campaign queued for sending!')
      fetchBroadcasts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send')
    }
  }

  const handleCancel = async (id) => {
    try {
      await api.post(`/broadcasts/${id}/cancel`)
      toast.success('Campaign cancelled')
      fetchBroadcasts()
    } catch (err) {
      toast.error('Failed to cancel')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return
    try {
      await api.delete(`/broadcasts/${id}`)
      toast.success('Campaign deleted')
      fetchBroadcasts()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleCreated = () => {
    setShowCreate(false)
    fetchBroadcasts()
    toast.success('Campaign created!')
  }

  const filtered = broadcasts.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.templateName?.toLowerCase().includes(search.toLowerCase())
  )

  const statuses = ['all', 'draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled']

  const statusVariant = {
    draft: 'default',
    scheduled: 'yellow',
    running: 'blue',
    completed: 'green',
    failed: 'red',
    cancelled: 'default',
    paused: 'yellow',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-jakarta">Broadcast Campaigns</h2>
          <p className="text-sm text-gray-500">{pagination.total} total campaigns</p>
        </div>
        <Button variant="gradient" leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all',
                  statusFilter === s
                    ? 'bg-brand-purple text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Campaign Name</TableHeader>
              <TableHeader>Template</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Recipients</TableHeader>
              <TableHeader>Sent</TableHeader>
              <TableHeader>Delivered</TableHeader>
              <TableHeader>Read</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded skeleton" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell className="py-16 text-center" colSpan={9}>
                  <div className="flex flex-col items-center gap-2">
                    <Megaphone size={32} className="text-gray-200" />
                    <p className="text-gray-500 text-sm">No campaigns found</p>
                    <Button variant="gradient" size="sm" onClick={() => setShowCreate(true)} leftIcon={<Plus size={14} />}>
                      Create First Campaign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-purple/10 rounded-lg flex items-center justify-center shrink-0">
                        <Megaphone size={14} className="text-brand-purple" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">{b.name}</p>
                        <p className="text-xs text-gray-400">{b.waAccountId?.displayName || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 font-mono">{b.templateName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[b.status] || 'default'} dot className="capitalize">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{formatNumber(b.recipients?.count || 0)}</TableCell>
                  <TableCell className="text-sm">{formatNumber(b.stats?.sent || 0)}</TableCell>
                  <TableCell className="text-sm">{formatNumber(b.stats?.delivered || 0)}</TableCell>
                  <TableCell className="text-sm">{formatNumber(b.stats?.read || 0)}</TableCell>
                  <TableCell className="text-xs text-gray-500">{formatDateTime(b.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {b.status === 'draft' && (
                        <button
                          onClick={() => handleSend(b._id)}
                          className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                          title="Send"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      {b.status === 'running' && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <Pause size={14} />
                        </button>
                      )}
                      {['draft', 'cancelled', 'failed', 'completed'].includes(b.status) && (
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Campaign Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Campaign" size="lg">
        <CreateCampaignWizard onSuccess={handleCreated} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  )
}

export default CampaignsPage
