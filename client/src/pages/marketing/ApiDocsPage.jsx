import { Link } from 'react-router-dom'
import { Zap, ShoppingBag, CreditCard, Users, FileText, ArrowRight } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'

const INTEGRATIONS = [
  { icon: ShoppingBag, title: 'Shopify', desc: 'Sync orders, customers and abandoned carts automatically.', href: '/integrations/shopify' },
  { icon: ShoppingBag, title: 'WooCommerce', desc: 'Order and customer automation for WordPress stores.', href: '/integrations/woocommerce' },
  { icon: CreditCard, title: 'Razorpay', desc: 'Send and confirm payment links inside WhatsApp chats.', href: '/integrations/razorpay' },
  { icon: Users, title: 'Zoho CRM', desc: 'Two-way contact and conversation sync with your pipeline.', href: '/integrations/zoho-crm' },
  { icon: FileText, title: 'Google Sheets', desc: 'Import contacts and export data with one click.', href: '/integrations/google-sheets' },
]

const ApiDocsPage = () => (
  <MarketingLayout>
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
      <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Developers</span>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">API & Integration Docs</h1>
      <p className="text-lg text-gray-500 max-w-xl mx-auto">No-code integrations you can set up today, and what's coming for developers.</p>
    </div>

    {/* Available integrations */}
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Connect without writing code</h2>
      <p className="text-sm text-gray-500 mb-6">Every integration below connects in a few clicks from your dashboard's Settings page — no API keys or code required.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {INTEGRATIONS.map(({ icon: Icon, title, desc, href }) => (
          <Link key={title} to={href} className="p-5 border border-gray-100 rounded-2xl hover:border-purple-200 transition-colors">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg,#7B2FBE20,#4A6CF720)' }}>
              <Icon size={18} className="text-brand-purple" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </Link>
        ))}
      </div>
    </div>

    {/* Developer API roadmap */}
    <div className="max-w-3xl mx-auto px-6 pb-12">
      <div className="bg-gray-50 rounded-3xl p-8">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-brand-purple" />
          <h2 className="text-lg font-bold text-gray-900">Custom REST API — coming soon</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          We're building a dedicated developer API with API-key authentication so you can send messages, manage contacts, and trigger flows directly from your own systems — beyond the built-in integrations above.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Want early access or need a custom integration built for your stack in the meantime? Our team can usually wire up a direct data sync manually while the public API is in progress.
        </p>
      </div>
    </div>

    <div className="max-w-3xl mx-auto px-6 pb-16">
      <div className="text-white rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg,#1A0A2E,#3B1560)' }}>
        <h2 className="text-2xl font-bold mb-2">Need a custom integration?</h2>
        <p className="text-gray-300 mb-6">Tell us what you're trying to connect — we'll help you figure out the fastest path.</p>
        <a href="mailto:adswadiofficial@gmail.com" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
          Contact Us <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </MarketingLayout>
)

export default ApiDocsPage
