import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Clock, Users } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'

const CASE_STUDIES = [
  {
    industry: 'D2C Fashion Brand',
    icon: TrendingUp,
    headline: 'Recovered 30%+ of abandoned carts with automated WhatsApp reminders',
    story: 'A growing D2C fashion store was losing a large share of checkouts to cart abandonment, with email reminders barely getting opened. After connecting their Shopify store to Adswadi and setting up an automated abandoned-cart flow with a direct payment link, a meaningful share of abandoned carts started converting within the first month — with messages typically read within minutes instead of sitting unopened in an inbox.',
    metric: '30%+ cart recovery',
    note: 'Illustrative example based on typical results seen with the Abandoned Cart automation flow.',
  },
  {
    industry: 'Coaching Institute',
    icon: Users,
    headline: 'Cut missed admission follow-ups to near zero with automated nurture flows',
    story: 'A coaching institute handling hundreds of admission enquiries a month struggled to follow up with every lead in time — many went cold simply from delayed replies. By setting up an instant first-response flow and automated fee-deadline reminders, the team stopped losing leads to slow follow-up and reduced late fee payments significantly.',
    metric: 'Faster lead follow-up',
    note: 'Illustrative example based on typical results seen with the Automation Flows feature in the Education vertical.',
  },
  {
    industry: 'Local Service Business',
    icon: Clock,
    headline: 'Freed up 10+ hours a week by automating repetitive customer questions',
    story: 'A multi-location service business was fielding the same handful of questions — pricing, timing, availability — dozens of times a day across staff phones. Moving to a shared Adswadi inbox with an AI-trained auto-reply for common questions let the team focus only on conversations that actually needed a human.',
    metric: '10+ hours saved weekly',
    note: 'Illustrative example based on typical results seen with the AI Chatbot feature.',
  },
]

const CaseStudiesPage = () => (
  <MarketingLayout>
    <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
      <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Case Studies</span>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How businesses grow with Adswadi</h1>
      <p className="text-lg text-gray-500 max-w-xl mx-auto">Real ways teams use WhatsApp automation to save time and recover revenue.</p>
    </div>

    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      {CASE_STUDIES.map(({ industry, icon: Icon, headline, story, metric, note }) => (
        <div key={industry} className="border border-gray-100 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7B2FBE20,#4A6CF720)' }}>
              <Icon size={18} className="text-brand-purple" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{industry}</p>
              <p className="text-sm font-bold text-purple-600">{metric}</p>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{headline}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{story}</p>
          <p className="text-xs text-gray-400 italic">{note}</p>
        </div>
      ))}
    </div>

    <div className="max-w-4xl mx-auto px-6 pb-16">
      <div className="text-white rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg,#1A0A2E,#3B1560)' }}>
        <h2 className="text-2xl font-bold mb-2">Want to be our next success story?</h2>
        <p className="text-gray-300 mb-6">Start your free trial and see results within your first week.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
          Start Free Trial <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </MarketingLayout>
)

export default CaseStudiesPage
