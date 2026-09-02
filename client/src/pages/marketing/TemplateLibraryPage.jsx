import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, ArrowRight } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'

const TEMPLATES = [
  { category: 'E-commerce', title: 'Order Confirmation', text: 'Hi {{name}}, thank you for your order! Your order #{{order_id}} of {{amount}} has been confirmed and will be shipped within 24 hours. Track it anytime — just reply here.' },
  { category: 'E-commerce', title: 'Abandoned Cart Reminder', text: 'Hi {{name}}, you left {{product}} in your cart! Complete your purchase now and get it delivered in 2-3 days. Tap here to pay: {{payment_link}}' },
  { category: 'Healthcare', title: 'Appointment Reminder', text: 'Hi {{name}}, this is a reminder for your appointment with Dr. {{doctor}} tomorrow at {{time}}. Reply CONFIRM to keep it or RESCHEDULE to change the time.' },
  { category: 'Education', title: 'Admission Follow-Up', text: 'Hi {{name}}, thanks for your interest in {{course}}! Our counsellor will call you within 24 hours. Have questions right now? Just reply here.' },
  { category: 'Finance', title: 'EMI Due Reminder', text: 'Hi {{name}}, your EMI of {{amount}} is due on {{due_date}}. Pay now to avoid late charges: {{payment_link}}' },
  { category: 'Real Estate', title: 'Site Visit Confirmation', text: 'Hi {{name}}, your site visit for {{property}} is confirmed on {{date}} at {{time}}. Our executive {{agent_name}} will meet you there. See you soon!' },
  { category: 'Events', title: 'Event Reminder', text: 'Hi {{name}}, {{event_name}} is happening tomorrow at {{venue}}, {{time}}. Your entry pass: {{ticket_id}}. See you there!' },
  { category: 'General', title: 'Welcome Message', text: 'Hi {{name}}, welcome to {{business_name}}! 👋 We\'re here to help — ask us anything about our products, pricing, or support.' },
  { category: 'General', title: 'Feedback Request', text: 'Hi {{name}}, thanks for choosing {{business_name}}! We\'d love your feedback — how was your experience? Reply with a rating from 1-5.' },
]

const CATEGORIES = ['All', ...new Set(TEMPLATES.map((t) => t.category))]

const TemplateLibraryPage = () => {
  const [filter, setFilter] = useState('All')
  const [copiedIdx, setCopiedIdx] = useState(null)

  const visible = filter === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === filter)

  const handleCopy = (text, idx) => {
    navigator.clipboard?.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Template Library</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Ready-to-use WhatsApp templates</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">Copy, customize, and submit for Meta approval — or use directly in your Adswadi Automation Flows.</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filter === cat ? 'text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            style={filter === cat ? { background: 'linear-gradient(90deg,#7B2FBE,#4A6CF7)' } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 grid sm:grid-cols-2 gap-4">
        {visible.map((tpl, idx) => (
          <div key={tpl.title} className="border border-gray-100 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{tpl.category}</span>
              <button onClick={() => handleCopy(tpl.text, idx)} className="text-gray-400 hover:text-gray-700 transition-colors">
                {copiedIdx === idx ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
              </button>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">{tpl.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl p-3 flex-1">{tpl.text}</p>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="text-white rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg,#1A0A2E,#3B1560)' }}>
          <h2 className="text-2xl font-bold mb-2">Automate these templates end-to-end</h2>
          <p className="text-gray-300 mb-6">Use them inside Automation Flows to trigger automatically — no manual sending.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </MarketingLayout>
  )
}

export default TemplateLibraryPage
