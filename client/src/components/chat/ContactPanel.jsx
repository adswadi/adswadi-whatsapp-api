import { useEffect, useState } from 'react'
import { X, Phone, Mail, Tag, Clock, User, Edit2, Save, Calendar } from 'lucide-react'
import api from '@/lib/api'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const ContactPanel = ({ contactId, onClose }) => {
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!contactId) return
    const fetchContact = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/contacts/${contactId}`)
        const c = res.data.data.contact
        setContact(c)
        setForm({
          name: c.name,
          email: c.email || '',
          notes: c.notes || '',
          tags: (c.tags || []).join(', '),
        })
      } catch (_) {}
      setLoading(false)
    }
    fetchContact()
  }, [contactId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/contacts/${contactId}`, {
        name: form.name,
        email: form.email,
        notes: form.notes,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      })
      toast.success('Contact updated!')
      setEditing(false)
      const res = await api.get(`/contacts/${contactId}`)
      setContact(res.data.data.contact)
    } catch (_) { toast.error('Update failed') }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="w-full p-4 space-y-4">
        <div className="h-20 bg-gray-100 rounded-2xl skeleton" />
        <div className="h-32 bg-gray-100 rounded-2xl skeleton" />
        <div className="h-24 bg-gray-100 rounded-2xl skeleton" />
      </div>
    )
  }

  if (!contact) return null

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="font-bold text-gray-900 text-sm font-jakarta">Contact Info</p>
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button variant="ghost" size="xs" onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="gradient" size="xs" loading={saving} onClick={handleSave} leftIcon={<Save size={12} />}>Save</Button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
              <Edit2 size={15} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Contact avatar and name */}
        <div className="flex flex-col items-center text-center">
          <Avatar name={contact.name} size="xl" className="mb-3" />
          {editing ? (
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="text-center font-bold text-gray-900 font-jakarta text-lg border-b-2 border-brand-purple bg-transparent outline-none w-full"
            />
          ) : (
            <h3 className="font-bold text-gray-900 font-jakarta text-lg">{contact.name}</h3>
          )}
          <Badge variant={contact.optedOut ? 'red' : contact.optedIn ? 'green' : 'default'} dot className="mt-1">
            {contact.optedOut ? 'Opted Out' : contact.optedIn ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-brand-purple/10 rounded-lg flex items-center justify-center shrink-0">
              <Phone size={14} className="text-brand-purple" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Phone</p>
              <p className="text-gray-900 font-semibold">{contact.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center shrink-0">
              <Mail size={14} className="text-brand-blue" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-medium uppercase">Email</p>
              {editing ? (
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="text-gray-900 border-b border-gray-300 bg-transparent outline-none text-sm w-full"
                />
              ) : (
                <p className="text-gray-900">{contact.email || '—'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 bg-brand-pink/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Tag size={14} className="text-brand-pink" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-medium uppercase mb-1">Tags</p>
              {editing ? (
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="text-gray-900 border-b border-gray-300 bg-transparent outline-none text-sm w-full"
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {contact.tags?.length > 0
                    ? contact.tags.map((tag) => (
                        <Badge key={tag} variant="purple" className="text-[10px]">#{tag}</Badge>
                      ))
                    : <span className="text-gray-400 text-xs">No tags</span>
                  }
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Added</p>
              <p className="text-gray-900">{formatDate(contact.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase">Last Seen</p>
              <p className="text-gray-900">{contact.lastSeen ? formatDateTime(contact.lastSeen) : 'Never'}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase mb-2">Notes</p>
          {editing ? (
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add notes about this contact..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 resize-none"
            />
          ) : (
            <div className="bg-gray-50 rounded-xl p-3 min-h-[60px]">
              <p className="text-sm text-gray-600">{contact.notes || <span className="text-gray-400 italic">No notes added</span>}</p>
            </div>
          )}
        </div>

        {/* Custom fields */}
        {contact.customFields && Object.keys(contact.customFields).length > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase mb-2">Custom Fields</p>
            <div className="space-y-1">
              {Object.entries(contact.customFields).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                  <span className="text-gray-500 capitalize">{key}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-brand-purple">{contact.messageCount || 0}</p>
            <p className="text-[10px] text-gray-500">Messages</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-brand-blue">{contact.source || 'manual'}</p>
            <p className="text-[10px] text-gray-500">Source</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPanel
