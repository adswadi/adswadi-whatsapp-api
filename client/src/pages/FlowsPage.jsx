import { useEffect, useState } from 'react'
import { Plus, GitBranch, Trash2, Edit, Zap, ToggleLeft, ToggleRight } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import FlowBuilder from '@/components/flows/FlowBuilder'
import { formatDateTime, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const TRIGGER_LABELS = {
  keyword: 'Keyword Match',
  first_message: 'First Message',
  opt_in: 'Opt-In',
  schedule: 'Schedule',
  broadcast_reply: 'Broadcast Reply',
  button_click: 'Button Click',
}

const FlowsPage = () => {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingFlow, setEditingFlow] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', triggerType: 'keyword', keywords: '' })

  const fetchFlows = async () => {
    setLoading(true)
    try {
      const res = await api.get('/flows')
      setFlows(res.data.data.flows || [])
    } catch (_) { toast.error('Failed to load flows') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchFlows() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Flow name required')
    try {
      const payload = {
        name: form.name,
        description: form.description,
        trigger: {
          type: form.triggerType,
          keywords: form.keywords ? form.keywords.split(',').map((k) => k.trim()) : [],
        },
        steps: [],
      }
      await api.post('/flows', payload)
      toast.success('Flow created!')
      setShowCreate(false)
      setForm({ name: '', description: '', triggerType: 'keyword', keywords: '' })
      fetchFlows()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create flow')
    }
  }

  const handleToggle = async (id, current) => {
    try {
      const res = await api.put(`/flows/${id}/toggle`)
      setFlows((prev) => prev.map((f) => f._id === id ? { ...f, isActive: res.data.data.isActive } : f))
      toast.success(res.data.message)
    } catch (_) { toast.error('Failed to toggle flow') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this flow?')) return
    try {
      await api.delete(`/flows/${id}`)
      toast.success('Flow deleted')
      fetchFlows()
    } catch (_) { toast.error('Failed to delete') }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-jakarta">Automation Flows</h2>
          <p className="text-sm text-gray-500">Automate WhatsApp conversations with triggers and actions</p>
        </div>
        <Button variant="gradient" leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
          New Flow
        </Button>
      </div>

      {/* Flows grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 skeleton" />
          ))}
        </div>
      ) : flows.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GitBranch size={28} className="text-brand-purple" />
          </div>
          <h3 className="font-bold text-gray-900 font-jakarta text-lg mb-1">No automation flows yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create flows to automatically respond to WhatsApp messages</p>
          <Button variant="gradient" leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
            Create First Flow
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flows.map((flow) => (
            <Card key={flow._id} hover>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', flow.isActive ? 'bg-whatsapp/10' : 'bg-gray-100')}>
                      <Zap size={18} className={flow.isActive ? 'text-whatsapp' : 'text-gray-400'} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm font-jakarta">{flow.name}</p>
                      <Badge variant={flow.isActive ? 'green' : 'default'} dot className="text-[10px] mt-0.5">
                        {flow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(flow._id, flow.isActive)}
                    className={cn('transition-colors', flow.isActive ? 'text-whatsapp' : 'text-gray-300')}
                  >
                    {flow.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {flow.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{flow.description}</p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="purple" className="text-[10px]">
                    {TRIGGER_LABELS[flow.trigger?.type] || 'Unknown trigger'}
                  </Badge>
                  {flow.trigger?.keywords?.length > 0 && (
                    <span className="text-xs text-gray-500">
                      "{flow.trigger.keywords.slice(0, 2).join(', ')}"
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500 bg-gray-50 rounded-xl p-2 mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{flow.stats?.triggered || 0}</p>
                    <p>Triggered</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{flow.stats?.completed || 0}</p>
                    <p>Completed</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{flow.steps?.length || 0}</p>
                    <p>Steps</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Edit size={12} />}
                    onClick={() => setEditingFlow(flow)}
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => handleDelete(flow._id)}
                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors border border-gray-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Flow Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Automation Flow">
        <form onSubmit={handleCreate}>
          <ModalBody className="space-y-4">
            <Input
              label="Flow Name"
              placeholder="e.g. Welcome Message Flow"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Description (optional)"
              placeholder="What does this flow do?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trigger Type</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                value={form.triggerType}
                onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
              >
                {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            {form.triggerType === 'keyword' && (
              <Input
                label="Keywords (comma separated)"
                placeholder="hi, hello, start, help"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                hint="Flow will trigger when any of these keywords are received"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="gradient" type="submit">Create Flow</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Flow Builder Modal */}
      {editingFlow && (
        <Modal
          isOpen={!!editingFlow}
          onClose={() => { setEditingFlow(null); fetchFlows() }}
          title={`Edit Flow: ${editingFlow.name}`}
          size="xl"
        >
          <FlowBuilder flow={editingFlow} onSave={() => { setEditingFlow(null); fetchFlows() }} />
        </Modal>
      )}
    </div>
  )
}

export default FlowsPage
