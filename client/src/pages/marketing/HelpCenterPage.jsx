import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { cn } from '@/lib/utils'

const FAQ_CATEGORIES = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'How do I connect my WhatsApp number?', a: 'Go to Settings → WhatsApp Accounts and click "Connect Number". You\'ll be guided through Meta\'s Embedded Signup — no manual token entry needed. Takes about 2 minutes.' },
      { q: 'Do I need a Meta Business Manager account?', a: 'No — you can connect without a verified Business Manager, but your messaging limit stays at 250 unique customers/24hrs until you verify. See our WhatsApp API guide for details.' },
      { q: 'Can I use my personal WhatsApp Business App number?', a: 'Yes, but a number can only be active in one place at a time — either the WhatsApp Business App or the API, not both. Once connected to Adswadi, the app will log out for that number. We recommend using a separate number if you want to keep using the app.' },
    ],
  },
  {
    category: 'Billing & Plans',
    questions: [
      { q: 'What happens after my 7-day free trial ends?', a: 'You\'ll need to upgrade to a paid plan to keep sending and receiving messages. Your data stays safe — you just won\'t have access until you renew.' },
      { q: 'How do I renew or upgrade my plan?', a: 'Renewals are currently handled by our team — reach out to adswadiofficial@gmail.com or +91 8678830021 and we\'ll process it right away.' },
      { q: 'Can I get an invoice for my payment?', a: 'Yes — every paid invoice is downloadable from Billing & Plans → Payment History.' },
    ],
  },
  {
    category: 'Messaging & Automation',
    questions: [
      { q: 'Why do I see a "display name approval" error?', a: 'This is a Meta-side restriction (#131037) tied to your specific WhatsApp number, not your Adswadi account. If your number status shows "AVAILABLE_WITHOUT_REVIEW" but sends still fail, it\'s a known Meta platform inconsistency — contact Meta Business Support with your phone number ID.' },
      { q: 'Can I send messages to customers who haven\'t messaged me first?', a: 'Yes, using an approved WhatsApp template message. Free-form text messages can only be sent within 24 hours of the customer\'s last message.' },
      { q: 'How do automation flows work?', a: 'Build a flow in the Flows tab with triggers (keyword or first message) and steps (send message, tag, assign, wait). It runs automatically the moment a matching message arrives.' },
    ],
  },
]

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <ChevronDown size={16} className={cn('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>}
    </div>
  )
}

const HelpCenterPage = () => (
  <MarketingLayout>
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
      <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Help Center</span>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How can we help?</h1>
      <p className="text-lg text-gray-500 max-w-xl mx-auto">Answers to the most common questions about Adswadi WhatsApp API.</p>
    </div>

    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {FAQ_CATEGORIES.map(({ category, questions }) => (
        <div key={category}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-3">
            {questions.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      ))}
    </div>

    <div className="max-w-3xl mx-auto px-6 pb-16">
      <div className="bg-gray-900 text-white rounded-3xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
        <p className="text-gray-400 mb-6">Our team typically replies within a few hours.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:adswadiofficial@gmail.com" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            <Mail size={16} /> adswadiofficial@gmail.com
          </a>
          <a href="tel:+918678830021" className="inline-flex items-center justify-center gap-2 border border-gray-700 px-6 py-3 rounded-xl font-semibold text-sm hover:border-gray-500 transition-colors">
            <Phone size={16} /> +91 8678830021
          </a>
        </div>
      </div>
    </div>

    <div className="max-w-3xl mx-auto px-6 pb-16 text-center">
      <Link to="/developers" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-purple hover:underline">
        <MessageCircle size={15} /> Looking for technical documentation? Visit API Docs →
      </Link>
    </div>
  </MarketingLayout>
)

export default HelpCenterPage
