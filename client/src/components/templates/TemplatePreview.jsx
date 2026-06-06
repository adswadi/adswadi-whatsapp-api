import { Phone, ExternalLink, Reply } from 'lucide-react'
import Badge from '@/components/ui/Badge'

const TemplatePreview = ({ template }) => {
  if (!template) return null

  const header = template.components?.find((c) => c.type === 'HEADER')
  const body = template.components?.find((c) => c.type === 'BODY')
  const footer = template.components?.find((c) => c.type === 'FOOTER')
  const buttons = template.components?.find((c) => c.type === 'BUTTONS')

  const STATUS_VARIANT = {
    APPROVED: 'green',
    PENDING: 'yellow',
    REJECTED: 'red',
    DISABLED: 'default',
  }

  return (
    <div className="space-y-5">
      {/* Template info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900 font-mono text-sm">{template.name}</p>
          <Badge variant={STATUS_VARIANT[template.status] || 'default'} dot>
            {template.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge variant="purple" className="text-[10px]">{template.category}</Badge>
          <Badge variant="default" className="text-[10px]">{template.language}</Badge>
        </div>
      </div>

      {/* Phone mockup */}
      <div className="flex justify-center">
        <div
          className="w-64 rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-900"
          style={{ minHeight: '300px' }}
        >
          {/* WhatsApp header */}
          <div className="bg-whatsapp px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Phone size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-xs">Business</p>
              <p className="text-white/70 text-[10px]">Online</p>
            </div>
          </div>

          {/* Chat background */}
          <div className="bg-[#ECE5DD] p-3 min-h-[220px]" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4c9b8\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}>
            {/* Message bubble */}
            <div className="bg-white rounded-xl rounded-tl-sm shadow-sm overflow-hidden max-w-[220px]">
              {/* Header */}
              {header && (
                <div>
                  {header.format === 'IMAGE' && (
                    <div className="w-full h-28 bg-gradient-hero flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Image</span>
                    </div>
                  )}
                  {header.format === 'VIDEO' && (
                    <div className="w-full h-28 bg-gray-800 flex items-center justify-center">
                      <span className="text-white text-xs">Video</span>
                    </div>
                  )}
                  {header.format === 'TEXT' && (
                    <div className="px-3 pt-3">
                      <p className="font-bold text-gray-900 text-sm">{header.text}</p>
                    </div>
                  )}
                  {header.format === 'DOCUMENT' && (
                    <div className="px-3 pt-3 flex items-center gap-2 bg-gray-50 py-2">
                      <div className="w-8 h-8 bg-brand-blue/10 rounded flex items-center justify-center">
                        <span className="text-xs text-brand-blue font-bold">PDF</span>
                      </div>
                      <p className="text-xs text-gray-700">Document</p>
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              {body && (
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{body.text}</p>
                </div>
              )}

              {/* Footer */}
              {footer && (
                <div className="px-3 pb-2">
                  <p className="text-[11px] text-gray-400">{footer.text}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="px-3 pb-2 flex justify-end">
                <span className="text-[10px] text-gray-400">10:30 AM ✓✓</span>
              </div>
            </div>

            {/* Buttons */}
            {buttons && buttons.buttons?.length > 0 && (
              <div className="mt-1 space-y-1 max-w-[220px]">
                {buttons.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm flex items-center justify-center gap-1.5 py-2 px-3 cursor-pointer hover:bg-gray-50"
                  >
                    {btn.type === 'URL' ? <ExternalLink size={12} className="text-whatsapp" /> : <Reply size={12} className="text-whatsapp" />}
                    <span className="text-sm text-whatsapp font-semibold">{btn.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw component info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><span className="font-semibold">Components:</span> {template.components?.map((c) => c.type).join(', ')}</p>
        {template.id && <p><span className="font-semibold">Template ID:</span> {template.id}</p>}
      </div>
    </div>
  )
}

export default TemplatePreview
