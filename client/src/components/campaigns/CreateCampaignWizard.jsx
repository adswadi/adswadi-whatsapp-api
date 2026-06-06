import { useEffect, useState } from 'react'
import { ChevronRight, ChevronLeft, Megaphone, Users, FileText, Calendar } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ModalBody, ModalFooter } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Megaphone },
  { id: 2, label: 'Recipients', icon: Users },
  { id: 3, label: 'Template', icon: FileText },
  { id: 4, label: 'Schedule', icon: Calendar },
]

const CreateCampaignWizard = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [templates, setTemplates] = useState([])
  const [tags, setTags] = useState([])

  const [form, setForm] = useState({
    name: '',
    waAccountId: '',
    recipientType: 'all',
    selectedTags: [],
    templateName: '',
    templateLanguage: 'en',
    scheduledAt: '',
    sendNow: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, tagRes] = await Promise.all([
          api.get('/whatsapp/accounts'),
          api.get('/contacts/tags'),
        ])
        const accs = accRes.data.data.accounts || []
        setAccounts(accs)
        if (accs.length > 0) setForm((f) => ({ ...f, waAccountId: accs[0]._id }))
        setTags(tagRes.data.data.tags || [])
      } catch (_) {}
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (form.waAccountId) {
      const account = accounts.find((a) => a._id === form.waAccountId)
      if (account) {
        api.get(`/whatsapp/accounts/${account._id}/templates`)
          .then((res) => setTemplates(res.data.data.templates || []))
          .catch(() => setTemplates([]))
      }
    }
  }, [form.waAccountId, accounts])

  const handleSubmit = async () => {
    if (!form.name) return toast.error('Campaign name required')
    if (!form.waAccountId) return toast.error('WhatsApp account required')
    if (!form.templateName) return toast.error('Template required')

    setLoading(true)
    try {
      const payload = {
        name: form.name,
        waAccountId: form.waAccountId,
        templateName: form.templateName,
        templateLanguage: form.templateLanguage,
        templateComponents: [],
        recipients: {
          type: form.recipientType,
          tags: form.selectedTags,
        },
        scheduledAt: !form.sendNow && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
      }

      const res = await api.post('/broadcasts', payload)
      const broadcastId = res.data.data.broadcast._id

      // If send now, queue immediately
      if (form.sendNow) {
        await api.post(`/broadcasts/${broadcastId}/send`)
      }

      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value || e })

  const canProceed = () => {
    if (step === 1) return form.name && form.waAccountId
    if (step === 2) return form.recipientType
    if (step === 3) return form.templateName
    return true
  }

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center px-6 pt-4 pb-2">
        {STEPS.map(({ id, label, icon: Icon }, i) => (
          <div key={id} className="flex items-center flex-1 last:flex-none">
            <div className={cn('flex items-center gap-2', id === step ? 'text-brand-purple' : id < step ? 'text-whatsapp' : 'text-gray-300')}>
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                id === step ? 'bg-brand-purple text-white' : id < step ? 'bg-whatsapp text-white' : 'bg-gray-100 text-gray-400'
              )}>
                {id < step ? '✓' : id}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2', step > id ? 'bg-whatsapp' : 'bg-gray-100')} />
            )}
          </div>
        ))}
      </div>

      <ModalBody className="space-y-4 min-h-[260px]">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Campaign Name"
              placeholder="e.g. Diwali Sale Announcement"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Account</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                value={form.waAccountId}
                onChange={(e) => setForm({ ...form, waAccountId: e.target.value })}
              >
                <option value="">Select account</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>{acc.displayName} ({acc.phoneNumber})</option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No WhatsApp accounts connected. Go to Settings to add one.</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Recipients */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Send to</label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Contacts (opted-in)', desc: 'Send to all your opted-in contacts' },
                  { value: 'tags', label: 'By Tags', desc: 'Target contacts with specific tags' },
                  { value: 'segment', label: 'Segment', desc: 'Target a specific contact segment' },
                ].map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                      form.recipientType === value ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-100 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="recipientType"
                      value={value}
                      checked={form.recipientType === value}
                      onChange={() => setForm({ ...form, recipientType: value })}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {form.recipientType === 'tags' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        selectedTags: f.selectedTags.includes(tag)
                          ? f.selectedTags.filter((t) => t !== tag)
                          : [...f.selectedTags, tag],
                      }))}
                      className={cn(
                        'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                        form.selectedTags.includes(tag) ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                  {tags.length === 0 && <p className="text-xs text-gray-400">No tags found. Add tags to contacts first.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message Template</label>
              {templates.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                  No approved templates found. Create templates in your Meta Business account first.
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                  value={form.templateName}
                  onChange={(e) => setForm({ ...form, templateName: e.target.value })}
                >
                  <option value="">Select a template</option>
                  {templates.filter((t) => t.status === 'APPROVED').map((t) => (
                    <option key={t.id || t.name} value={t.name}>{t.name} ({t.language})</option>
                  ))}
                </select>
              )}
            </div>

            {form.templateName && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Template selected:</p>
                <p className="font-semibold text-gray-900 text-sm font-mono">{form.templateName}</p>
                {templates.find((t) => t.name === form.templateName)?.components?.find((c) => c.type === 'BODY')?.text && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-white p-2 rounded-lg border border-gray-100">
                    {templates.find((t) => t.name === form.templateName)?.components?.find((c) => c.type === 'BODY')?.text}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language</label>
              <select
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                value={form.templateLanguage}
                onChange={(e) => setForm({ ...form, templateLanguage: e.target.value })}
              >
                {['en', 'en_US', 'hi', 'mr', 'ta', 'te', 'kn', 'gu'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              {[
                { id: 'now', label: 'Send Now', desc: 'Start sending immediately' },
                { id: 'later', label: 'Schedule', desc: 'Schedule for a specific time' },
              ].map(({ id, label, desc }) => (
                <label
                  key={id}
                  className={cn(
                    'flex-1 flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                    (id === 'now' ? form.sendNow : !form.sendNow) ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-100 hover:border-gray-300'
                  )}
                >
                  <input
                    type="radio"
                    name="timing"
                    checked={id === 'now' ? form.sendNow : !form.sendNow}
                    onChange={() => setForm({ ...form, sendNow: id === 'now' })}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {!form.sendNow && (
              <Input
                label="Schedule Date & Time"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Campaign Summary</p>
              {[
                { label: 'Name', value: form.name },
                { label: 'Template', value: form.templateName },
                { label: 'Recipients', value: form.recipientType === 'all' ? 'All opted-in contacts' : form.recipientType === 'tags' ? `Tags: ${form.selectedTags.join(', ')}` : 'Custom segment' },
                { label: 'Send', value: form.sendNow ? 'Immediately' : `Scheduled: ${form.scheduledAt}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {step > 1 && (
          <Button variant="ghost" leftIcon={<ChevronLeft size={14} />} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        {step < 4 ? (
          <Button
            variant="gradient"
            rightIcon={<ChevronRight size={14} />}
            onClick={() => { if (canProceed()) setStep((s) => s + 1); else toast.error('Please fill required fields') }}
          >
            Continue
          </Button>
        ) : (
          <Button variant="gradient" loading={loading} onClick={handleSubmit} leftIcon={<Megaphone size={14} />}>
            {form.sendNow ? 'Launch Campaign' : 'Schedule Campaign'}
          </Button>
        )}
      </ModalFooter>
    </div>
  )
}

export default CreateCampaignWizard
