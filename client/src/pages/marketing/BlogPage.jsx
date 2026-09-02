import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { cn } from '@/lib/utils'

const POSTS = [
  {
    slug: 'whatsapp-api-vs-business-app',
    title: 'WhatsApp Business API vs. WhatsApp Business App: What\'s the Real Difference?',
    readTime: '5 min read',
    tag: 'Guide',
    excerpt: 'If you\'re scaling past a handful of daily chats, the free Business App starts breaking down. Here\'s exactly when — and why — to move to the API.',
    body: `The WhatsApp Business App is free and great for solo shop owners handling a handful of chats a day from one phone. But it breaks down fast once you're growing: only one device can be logged in at a time, there's no way to automate replies at scale, and you can't connect it to a CRM or run bulk campaigns.

The WhatsApp Business API (what platforms like Adswadi run on) is built for volume — unlimited team members replying from a shared inbox, automated flows, bulk broadcasts, and integrations with Shopify, Razorpay, and CRMs. The trade-off: it's cloud-hosted, so there's no physical app to open on a phone — everything happens through a dashboard like Adswadi's.

Rule of thumb: if you're still comfortable replying to every customer yourself from one phone, the App is fine. The moment you hire a second person to handle chats, or want to send a promotional broadcast to more than a few contacts, it's time to move to the API.`,
  },
  {
    slug: 'reduce-cart-abandonment-whatsapp',
    title: '5 Ways to Recover Abandoned Carts Using WhatsApp',
    readTime: '4 min read',
    tag: 'E-commerce',
    excerpt: 'Email cart-recovery gets ignored. WhatsApp messages get read within minutes. Here\'s how online stores are using it to win back lost sales.',
    body: `Cart abandonment emails have an average open rate under 20%. WhatsApp messages, by contrast, are typically opened within minutes of being sent — which is why e-commerce brands are shifting recovery campaigns there.

1. Send the first nudge within 30-60 minutes of abandonment, before intent fades.
2. Personalize it — mention the exact product left in the cart, not a generic "you forgot something".
3. Include a direct payment link so checkout happens in the same chat, no app switching.
4. Follow up once more after 24 hours with a small incentive if the cart is still open.
5. Track which messages actually convert and stop the sequence once someone completes a purchase.

Stores using automated WhatsApp cart-recovery flows on Adswadi typically recover 25-35% of abandoned carts — a number email alone rarely reaches.`,
  },
  {
    slug: 'ai-chatbot-vs-human-support',
    title: 'AI Chatbot vs. Human Support on WhatsApp: You Don\'t Have to Choose',
    readTime: '4 min read',
    tag: 'Automation',
    excerpt: 'The best support setups on WhatsApp aren\'t fully automated or fully manual — they\'re a handoff between the two. Here\'s how to design that split.',
    body: `Businesses often assume automating support means replacing agents entirely — but the highest-performing setups use AI for volume and humans for judgment.

Let an AI chatbot handle the repetitive 70-80% of conversations: order status, pricing, FAQs, store hours. Train it on your actual catalogue and policies so answers stay accurate. The moment a conversation needs empathy, negotiation, or a decision outside its training — a refund dispute, a custom order — hand it off to a live agent with the full conversation history attached, so the customer never has to repeat themselves.

This split cuts response time to under a few seconds for most queries while keeping a human in the loop exactly where it matters. It's the model built into Adswadi's Automation Flows: AI-first, human-backed.`,
  },
]

const BlogPage = () => {
  const [openSlug, setOpenSlug] = useState(null)

  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-4 text-center">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Blog</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Insights on WhatsApp marketing & automation</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">Practical guides for growing your business on WhatsApp.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {POSTS.map((post) => {
          const isOpen = openSlug === post.slug
          return (
            <article key={post.slug} className="border border-gray-100 rounded-2xl overflow-hidden">
              <button onClick={() => setOpenSlug(isOpen ? null : post.slug)} className="w-full text-left p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{post.tag}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> {post.readTime}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-brand-purple mt-3', isOpen && 'hidden')}>
                  Read article <ArrowRight size={14} />
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-50 pt-4">
                  {post.body}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <p className="text-sm text-gray-400 mb-3">Want a topic covered? Tell us what you're stuck on.</p>
        <Link to="/help-center" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-purple hover:underline">
          Visit Help Center <ArrowRight size={14} />
        </Link>
      </div>
    </MarketingLayout>
  )
}

export default BlogPage
