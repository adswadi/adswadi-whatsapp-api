import { useEffect, useState } from 'react'
import { FileText, RefreshCw, Eye, Search, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import TemplatePreview from '@/components/templates/TemplatePreview'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_VARIANT = {
  APPROVED: 'green',
  PENDING: 'yellow',
  REJECTED: 'red',
  DISABLED: 'default',
}

const CATEGORY_LABELS = {
  MARKETING: 'Marketing',
  UTILITY: 'Utility',
  AUTHENTICATION: 'Auth',
}

const TemplatesPage = () => {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get('/whatsapp/accounts')
        const accs = res.data.data.accounts || []
        setAccounts(accs)
        if (accs.length > 0) setSelectedAccount(accs[0])
      } catch (_) {}
    }
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) fetchTemplates()
  }, [selectedAccount])

  const fetchTemplates = async () => {
    if (!selectedAccount) return
    setLoading(true)
    try {
      const res = await api.get(`/whatsapp/accounts/${selectedAccount._id}/templates`)
      setTemplates(res.data.data.templates || [])
    } catch (err) {
      toast.error('Failed to fetch templates. Check your WhatsApp account.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'ALL' || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  const categories = ['ALL', ...new Set(templates.map((t) => t.category).filter(Boolean))]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-jakarta">Message Templates</h2>
          <p className="text-sm text-gray-500">Templates approved by Meta for outbound messaging</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={fetchTemplates} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Account selector */}
      {accounts.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {accounts.map((acc) => (
            <button
              key={acc._id}
              onClick={() => setSelectedAccount(acc)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
                selectedAccount?._id === acc._id
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-purple/50'
              )}
            >
              {acc.displayName}
              <span className="ml-2 text-xs opacity-70">{acc.phoneNumber}</span>
            </button>
          ))}
        </div>
      )}

      {!selectedAccount && (
        <div className="text-center py-20">
          <AlertCircle size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="font-bold text-gray-700">No WhatsApp account connected</p>
          <p className="text-sm text-gray-500 mt-1">Go to Settings to connect your WhatsApp Business account</p>
        </div>
      )}

      {selectedAccount && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/30 bg-white"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    categoryFilter === cat ? 'bg-brand-purple text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl skeleton" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => {
                const body = template.components?.find((c) => c.type === 'BODY')
                const header = template.components?.find((c) => c.type === 'HEADER')
                const buttons = template.components?.find((c) => c.type === 'BUTTONS')

                return (
                  <Card key={template.id || template.name} hover>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate font-jakarta">{template.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={STATUS_VARIANT[template.status] || 'default'} dot className="text-[10px]">
                              {template.status}
                            </Badge>
                            <Badge variant="purple" className="text-[10px] capitalize">
                              {CATEGORY_LABELS[template.category] || template.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {header && header.format === 'TEXT' && (
                        <p className="text-xs font-bold text-gray-700 mb-1">{header.text}</p>
                      )}

                      {body && (
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50 p-2.5 rounded-lg mb-3">
                          {body.text}
                        </p>
                      )}

                      {buttons && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {buttons.buttons?.slice(0, 2).map((btn, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 bg-brand-blue/10 text-brand-blue rounded-md font-semibold">
                              {btn.text}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{template.language}</span>
                        <Button
                          variant="outline"
                          size="xs"
                          leftIcon={<Eye size={11} />}
                          onClick={() => setPreviewTemplate(template)}
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <Modal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title="Template Preview"
          size="sm"
        >
          <div className="p-6">
            <TemplatePreview template={previewTemplate} />
          </div>
        </Modal>
      )}
    </div>
  )
}

export default TemplatesPage
