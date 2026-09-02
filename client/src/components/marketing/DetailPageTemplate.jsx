import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { ICON_MAP } from '@/data/iconMap'

// Shared layout for /features/:slug, /industries/:slug and /integrations/:slug
// — all three are the same hero + stats + feature-grid + CTA shape, just
// pointed at a different content object.
const DetailPageTemplate = ({ data }) => {
  const HeroIcon = ICON_MAP[data.icon]

  return (
    <MarketingLayout>
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">{data.badge}</span>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{data.title}</h1>
          <p className="text-lg text-gray-500 mb-6">{data.subtitle}</p>
          <Link to="/register" className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-transform hover:scale-105" style={{ background: 'linear-gradient(90deg,#7B2FBE,#4A6CF7)' }}>
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </div>
        <div className="aspect-square rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7B2FBE20,#4A6CF720,#E91E8C20)' }}>
          {HeroIcon && <HeroIcon size={96} className="text-brand-purple" strokeWidth={1.5} />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <p className="text-gray-600 leading-relaxed text-base bg-gray-50 rounded-3xl p-8">{data.intro}</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {data.stats.map(({ number, label }) => (
            <div key={label} className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="text-2xl font-extrabold text-purple-600 mb-1">{number}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What's included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.features.map(({ icon, title, desc }) => {
            const Icon = ICON_MAP[icon]
            return (
              <div key={title} className="p-6 border border-gray-100 rounded-2xl hover:border-purple-200 transition-colors">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#7B2FBE20,#4A6CF720)' }}>
                  {Icon && <Icon size={20} className="text-brand-purple" />}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="text-white rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg,#1A0A2E,#3B1560)' }}>
          <h2 className="text-2xl font-bold mb-2">{data.ctaTitle}</h2>
          <p className="text-gray-300 mb-6">{data.ctaSubtitle}</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
            <CheckCircle size={16} /> Get Started Free
          </Link>
        </div>
      </div>
    </MarketingLayout>
  )
}

export default DetailPageTemplate
