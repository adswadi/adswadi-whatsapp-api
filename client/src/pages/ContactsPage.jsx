import { useEffect, useState } from 'react'
import { Plus, Upload, Download, Search, Trash2, Users, Filter, Tag, Phone, Mail } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table'
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import ImportModal from '@/components/contacts/ImportModal'
import { formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const ContactsPage = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [showImport, setShowImport] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({})
  const [tags, setTags] = useState([])
  const [tagFilter, setTagFilter] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', tags: '' })
  const [formLoading, setFormLoading] = useState(false)

  const fetchContacts = async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 20 })
      if (search) params.set('search', search)
      if (tagFilter) params.set('tags', tagFilter)
      const res = await api.get(`/contacts?${params}`)
      setContacts(res.data.data || [])
      setPagination(res.data.pagination || {})
    } catch (err) {
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [statsRes, tagsRes] = await Promise.all([
        api.get('/contacts/stats'),
        api.get('/contacts/tags'),
      ])
      setStats(statsRes.data.data)
      setTags(tagsRes.data.data.tags || [])
    } catch (_) {}
  }

  useEffect(() => { fetchStats() }, [])
  useEffect(() => { fetchContacts(page) }, [page, tagFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchContacts(1)
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    setFormLoading(true)
    try {
      await api.post('/contacts', {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      })
      toast.success('Contact added!')
      setShowAdd(false)
      setForm({ name: '', phone: '', email: '', tags: '' })
      fetchContacts(1)
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contact')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await api.delete(`/contacts/${id}`)
      toast.success('Contact deleted')
      fetchContacts(page)
      fetchStats()
    } catch (_) { toast.error('Failed to delete') }
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} contacts?`)) return
    try {
      await api.post('/contacts/bulk/delete', { ids: selectedIds })
      toast.success(`${selectedIds.length} contacts deleted`)
      setSelectedIds([])
      fetchContacts(1)
      fetchStats()
    } catch (_) { toast.error('Bulk delete failed') }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/contacts/export/csv', { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contacts.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (_) { toast.error('Export failed') }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === contacts.length ? [] : contacts.map((c) => c._id))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-jakarta">Contacts</h2>
          <p className="text-sm text-gray-500">{pagination.total || 0} total contacts</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {selectedIds.length > 0 && (
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleBulkDelete}>
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Upload size={14} />} onClick={() => setShowImport(true)}>
            Import
          </Button>
          <Button variant="gradient" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total || 0, color: 'text-brand-purple' },
          { label: 'Opted In', value: stats.optedIn || 0, color: 'text-whatsapp' },
          { label: 'Opted Out', value: stats.optedOut || 0, color: 'text-red-500' },
          { label: 'Blocked', value: stats.blocked || 0, color: 'text-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <p className={`text-2xl font-extrabold font-jakarta ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
          </form>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTagFilter('')}
              className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg', !tagFilter ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              All
            </button>
            {tags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg', tagFilter === tag ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                #{tag}
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
              <TableHeader>
                <input type="checkbox" checked={selectedIds.length === contacts.length && contacts.length > 0} onChange={toggleSelectAll} className="rounded" />
              </TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Tags</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Added</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded skeleton" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell className="py-16 text-center" colSpan={8}>
                  <Users size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-500 text-sm">No contacts found</p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c._id)}
                      onChange={() => toggleSelect(c._id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar name={c.name} size="sm" />
                      <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Phone size={12} className="text-gray-400" />
                      {c.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{c.email || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="purple" className="text-[10px]">#{tag}</Badge>
                      ))}
                      {c.tags?.length > 2 && <Badge variant="default" className="text-[10px]">+{c.tags.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.optedOut ? 'red' : c.optedIn ? 'green' : 'default'} dot>
                      {c.optedOut ? 'Opted Out' : c.optedIn ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{formatDate(c.createdAt)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="secondary" size="xs" disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Import modal */}
      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => { setShowImport(false); fetchContacts(1); fetchStats() }}
      />

      {/* Add Contact Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Contact">
        <form onSubmit={handleAddContact}>
          <ModalBody className="space-y-4">
            <Input label="Full Name *" placeholder="Rahul Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Phone Number *" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" placeholder="rahul@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Tags (comma separated)" placeholder="customer, vip, mumbai" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="gradient" type="submit" loading={formLoading}>Add Contact</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}

export default ContactsPage
