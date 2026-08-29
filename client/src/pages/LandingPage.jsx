import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, ChevronDown, Star, Play, X, Menu } from 'lucide-react'

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: 'Product', sub: ['WhatsApp Business API','Bulk Broadcast','AI Chatbot','Live Inbox','Automation Flows','Analytics'] },
  { label: 'Features', sub: ['Broadcasting','AI Auto-Reply','Chatbots','Payments','Forms','Catalogue'] },
  { label: 'Industries', sub: ['E-commerce','Education','Finance','Healthcare','Real Estate','Events'] },
  { label: 'Integrations', sub: ['Shopify','Razorpay','WooCommerce','Zoho CRM','Google Sheets'] },
  { label: 'Pricing', sub: null },
  { label: 'Resources', sub: ['Help Center','Blog','API Docs','Case Studies','YouTube'] },
]

// Real brand logos with exact brand colors + Google favicon service
const CLIENTS = [
  { name: 'Zomato',        color: '#E23744', bg: '#FFF0F1', favicon: 'zomato.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#E23744"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial">Z</text></svg> },
  { name: 'Swiggy',        color: '#FC8019', bg: '#FFF4EC', favicon: 'swiggy.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#FC8019"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">SW</text></svg> },
  { name: 'Razorpay',      color: '#072654', bg: '#EEF2FF', favicon: 'razorpay.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#072654"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">Rp</text></svg> },
  { name: 'Paytm',         color: '#002970', bg: '#EFF6FF', favicon: 'paytm.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#002970"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="#00B9F1" fontSize="10" fontWeight="900" fontFamily="Arial">PTM</text></svg> },
  { name: 'Nykaa',         color: '#FC2779', bg: '#FFF0F6', favicon: 'nykaa.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#FC2779"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">NK</text></svg> },
  { name: 'Meesho',        color: '#9F00C5', bg: '#F9F0FF', favicon: 'meesho.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#9F00C5"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">MS</text></svg> },
  { name: 'BYJU\'S',       color: '#3D2D8E', bg: '#F0EEFF', favicon: 'byjus.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#3D2D8E"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="#FFC807" fontSize="10" fontWeight="900" fontFamily="Arial">BYJ</text></svg> },
  { name: 'PhysicsWallah', color: '#0F4B8C', bg: '#EFF6FF', favicon: 'pw.live',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#0F4B8C"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">PW</text></svg> },
  { name: 'Myntra',        color: '#FF3F6C', bg: '#FFF0F3', favicon: 'myntra.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#FF3F6C"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">MN</text></svg> },
  { name: 'boAt',          color: '#E63946', bg: '#FFF0F0', favicon: 'boat-lifestyle.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#111"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">boAt</text></svg> },
  { name: 'MamaEarth',     color: '#7CB518', bg: '#F3FFDB', favicon: 'mamaearth.in',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#7CB518"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="900" fontFamily="Arial">ME</text></svg> },
  { name: 'Bajaj Finance',  color: '#003087', bg: '#EFF4FF', favicon: 'bajajfinserv.in',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#003087"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">BF</text></svg> },
  { name: 'Tata Motors',   color: '#1C3E6E', bg: '#EEF4FF', favicon: 'tatamotors.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#1C3E6E"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">TM</text></svg> },
  { name: 'Asian Paints',  color: '#A8151A', bg: '#FFF0F0', favicon: 'asianpaints.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#A8151A"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">AP</text></svg> },
  { name: 'Godrej',        color: '#005AA9', bg: '#EFF6FF', favicon: 'godrej.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#005AA9"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">GR</text></svg> },
  { name: 'Wipro',         color: '#341C74', bg: '#F2EEFF', favicon: 'wipro.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#341C74"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">WP</text></svg> },
  { name: 'IndiaMart',     color: '#FF6A00', bg: '#FFF3EB', favicon: 'indiamart.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#FF6A00"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Arial">IM</text></svg> },
  { name: 'OYO',           color: '#EF2B2D', bg: '#FFF0F0', favicon: 'oyorooms.com',
    svg: <svg viewBox="0 0 40 40" className="w-full h-full"><rect width="40" height="40" rx="8" fill="#EF2B2D"/><text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">OYO</text></svg> },
]

const WHATSAPP_STATS = [
  { value: '98%',   label: 'Open Rate',          sub: 'vs 20% email' },
  { value: '45-60%',label: 'Click Rate',          sub: 'vs 2-5% email' },
  { value: '2.6Bn+',label: 'Active Users',        sub: 'Worldwide' },
  { value: '5X',    label: 'Better ROI',          sub: 'vs other channels' },
]

const FEATURES = [
  {
    tag: '📤 Broadcast',
    headline: 'Lakhon customers ko ek click mein message bhejo',
    sub: 'Segment karo, personalize karo, schedule karo — aur track karo real-time mein.',
    points: ['Template-based campaigns','Smart audience segmentation','Delivery & read tracking','Schedule for best time'],
    color: '#7B2FBE',
    ui: 'broadcast',
  },
  {
    tag: '🤖 AI Chatbot',
    headline: 'Bot jo 24×7 customers ka khayal rakhta hai',
    sub: 'Keyword triggers, button flows, drip campaigns — sab bina coding ke.',
    points: ['No-code flow builder','Keyword auto-reply','Catalogue & payment bots','Hand-off to human agent'],
    color: '#4A6CF7',
    ui: 'chatbot',
  },
  {
    tag: '👥 Live Inbox',
    headline: 'Poori team ek inbox mein — koi conversation miss nahi',
    sub: 'Assign, resolve, tag karo. Agents ka response time track karo.',
    points: ['Multi-agent inbox','Assign conversations','Quick reply templates','Agent performance analytics'],
    color: '#E91E8C',
    ui: 'inbox',
  },
  {
    tag: '📊 Analytics',
    headline: 'Har rupee ka hisaab — real-time mein',
    sub: 'Campaign ROI, delivery funnel, agent performance — sab ek dashboard mein.',
    points: ['Campaign funnel (sent→read→replied)','ROAS tracking','Agent leaderboard','Export reports'],
    color: '#25D366',
    ui: 'analytics',
  },
]

const ADVANCED = [
  { emoji:'💳', title:'WhatsApp Payments', desc:'UPI & card payments directly inside WhatsApp chat.' },
  { emoji:'📝', title:'WhatsApp Forms',    desc:'Collect leads, feedback, bookings — no website needed.' },
  { emoji:'📢', title:'Click-to-WA Ads',  desc:'Facebook/Google ads that open WhatsApp directly.' },
  { emoji:'🔗', title:'1000+ Integrations',desc:'Shopify, Razorpay, Zoho, Google Sheets & more.' },
]

const FREE_BENEFITS = [
  'Free WhatsApp Business API access',
  'Free WhatsApp green tick application support',
  'Free onboarding & setup assistance',
  'Free campaign strategy consultation',
  'Free templates library (500+ ready templates)',
  'No setup fees. No hidden charges.',
]

const TESTIMONIALS = [
  {
    quote: 'Adswadi ne hamara WhatsApp marketing completely transform kar diya. Pehle mahine mein hi 3X ROAS mila.',
    name: 'Rahul Sharma', title: 'Marketing Head', company: 'FashionHub India',
    avatar: 'R', rating: 5,
  },
  {
    quote: 'Bot ka flow builder itna easy hai ki hamare non-tech team ne bhi use kar liya. Customer satisfaction 40% badh gayi.',
    name: 'Priya Mehta', title: 'Founder', company: 'EduTech Solutions',
    avatar: 'P', rating: 5,
  },
  {
    quote: '₹999 mein itna powerful platform? AiSensy se compare karein toh Adswadi far better value for Indian businesses.',
    name: 'Amit Patel', title: 'CEO', company: 'QuickCommerce',
    avatar: 'A', rating: 5,
  },
]

const FAQS = [
  { q: 'Adswadi WhatsApp API kya hai?', a: 'Adswadi ek WhatsApp Business API platform hai jo Indian businesses ko bulk messaging, chatbots, live chat aur analytics ki power deta hai — sab officially Meta approved.' },
  { q: 'Kya mujhe technical knowledge chahiye?', a: 'Bilkul nahi! Hamara no-code flow builder aur simple dashboard koi bhi use kar sakta hai bina coding ke.' },
  { q: 'WhatsApp message charges kitne hain?', a: 'Meta ke charges: Marketing messages ₹1.09/msg, Utility ₹0.145/msg, Authentication ₹0.145/msg. Platform fee alag se plan ke hisaab se.' },
  { q: 'Green tick kaise milega?', a: 'Hum aapka Meta Business Verification aur WhatsApp green tick application mein free mein help karte hain.' },
  { q: 'Kya free trial hai?', a: 'Haan! Free Forever plan mein 1,000 conversations/month milte hain. Credit card ki zaroorat nahi.' },
  { q: 'Existing contacts import kar sakte hain?', a: 'Haan, CSV/Excel se bulk import supported hai. Opt-in contacts ko segmented campaigns bhej sakte ho.' },
]

const PLANS = [
  { name:'Free',       price:'₹0',     mo:'/month', tag:'',             color:'#6B7280',
    features:['1,000 conversations/mo','1 agent','1 WA number','Basic flows','Analytics'] },
  { name:'Starter',    price:'₹999',   mo:'/month', tag:'',             color:'#4A6CF7',
    features:['5,000 conversations/mo','3 agents','2 WA numbers','All automations','Priority support'] },
  { name:'Growth',     price:'₹2,499', mo:'/month', tag:'Most Popular', color:'#7B2FBE',
    features:['20,000 conversations/mo','10 agents','5 WA numbers','API access','White-label option'] },
  { name:'Enterprise', price:'₹6,999', mo:'/month', tag:'',             color:'#E91E8C',
    features:['Unlimited conversations','Unlimited agents','Custom integrations','Dedicated manager','SLA'] },
]

/* ═══════════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════════ */

// ── Single brand logo card ─────────────────────────
const BrandLogo = ({ name, color, bg, favicon, svg }) => {
  const [faviconOk, setFaviconOk] = useState(true)
  // Google's S2 favicon service — returns real brand logo at 64px, very reliable
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${favicon}&sz=64`

  return (
    <div
      className="flex items-center gap-3 mx-4 px-5 py-3 rounded-2xl border whitespace-nowrap min-w-max cursor-default select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: '#fff',
        borderColor: color + '22',
        boxShadow: `0 2px 12px ${color}10`,
      }}
    >
      {/* Logo icon box */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative"
        style={{ background: bg, border: `1.5px solid ${color}25` }}
      >
        {faviconOk ? (
          <img
            src={faviconUrl}
            alt={name}
            className="w-7 h-7 object-contain"
            onError={() => setFaviconOk(false)}
          />
        ) : (
          /* Brand-colored SVG fallback */
          <div className="w-full h-full">{svg}</div>
        )}
      </div>

      {/* Brand name */}
      <span className="text-sm font-bold text-gray-700" style={{ letterSpacing: '-0.01em' }}>
        {name}
      </span>
    </div>
  )
}

// ── Marquee of logos ──────────────────────────────
const LogoMarquee = () => (
  <div className="overflow-hidden py-3 relative">
    {/* fade edges */}
    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
         style={{ background: 'linear-gradient(90deg,white 40%,transparent)' }}/>
    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
         style={{ background: 'linear-gradient(270deg,white 40%,transparent)' }}/>

    {/* Row 1 — forward */}
    <div className="flex mb-3" style={{ animation: 'marquee 40s linear infinite', width: 'max-content' }}>
      {[...CLIENTS, ...CLIENTS].map((c, i) => (
        <BrandLogo key={i} {...c} />
      ))}
    </div>

    {/* Row 2 — reverse (offset half) */}
    <div className="flex" style={{ animation: 'marquee 40s linear infinite reverse', width: 'max-content', animationDelay: '-20s' }}>
      {[...CLIENTS, ...CLIENTS].map((c, i) => (
        <BrandLogo key={i} {...c} />
      ))}
    </div>
  </div>
)

// ── WhatsApp Phone UI previews ────────────────────
const BroadcastUI = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ width: 320 }}>
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <span className="text-xs font-bold text-gray-700">📤 Create Broadcast</span>
      <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">● Live</span>
    </div>
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Campaign Name</p>
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-700 border border-gray-200">Diwali Sale 2024 🪔</div>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Template</p>
        <div className="bg-purple-50 rounded-lg px-3 py-2 border border-purple-200">
          <p className="text-[10px] text-purple-700 font-semibold">diwali_offer_v2 ✓ Approved</p>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 mb-1">Audience (12,450 contacts)</p>
        <div className="flex gap-2">
          {['All','VIP','Delhi'].map((t,i) => (
            <span key={t} className={`text-[10px] px-2 py-1 rounded-full font-semibold ${i===0?'bg-purple-600 text-white':'bg-gray-100 text-gray-600'}`}>{t}</span>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <p className="text-[10px] font-bold text-gray-500 mb-1">📱 Preview</p>
        <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none px-3 py-2 max-w-[85%] ml-auto">
          <p className="text-[9px] text-gray-800">Namaste {'{{'}1{'}}'} 👋</p>
          <p className="text-[9px] text-gray-800">Diwali pe <b>50% OFF</b> sirf aaj!</p>
          <p className="text-[9px] text-gray-800">Code: DIWALI50 🪔</p>
        </div>
      </div>
      <button className="w-full py-2.5 rounded-xl text-xs font-bold text-white" style={{ background:'linear-gradient(90deg,#7B2FBE,#E91E8C)' }}>
        🚀 Launch Campaign → 12,450 contacts
      </button>
    </div>
    {/* Stats bar */}
    <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-3 gap-2 bg-gray-50">
      {[{l:'Sent',v:'12,450',c:'#7B2FBE'},{l:'Read',v:'11,454',c:'#25D366'},{l:'Replied',v:'3,734',c:'#4A6CF7'}].map(({l,v,c})=>(
        <div key={l} className="text-center">
          <p className="text-sm font-extrabold font-jakarta" style={{color:c}}>{v}</p>
          <p className="text-[9px] text-gray-400">{l}</p>
        </div>
      ))}
    </div>
  </div>
)

const ChatbotUI = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ width: 320 }}>
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <span className="text-xs font-bold text-gray-700">🤖 Flow Builder</span>
      <span className="text-[10px] text-gray-400">No-code</span>
    </div>
    <div className="p-4">
      {/* flow nodes */}
      <div className="space-y-2">
        {/* trigger */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm shrink-0">⚡</div>
          <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-yellow-700">TRIGGER</p>
            <p className="text-[10px] text-gray-700">Keyword: "PRICE" or "OFFER"</p>
          </div>
        </div>
        <div className="ml-4 w-px h-4 bg-gray-300" />
        {/* send message */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm shrink-0">💬</div>
          <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-green-700">SEND MESSAGE</p>
            <p className="text-[10px] text-gray-700">Welcome + Catalogue link</p>
          </div>
        </div>
        <div className="ml-4 w-px h-4 bg-gray-300" />
        {/* wait */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0">⏱️</div>
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-blue-700">WAIT</p>
            <p className="text-[10px] text-gray-700">2 hours — no reply?</p>
          </div>
        </div>
        <div className="ml-4 w-px h-4 bg-gray-300" />
        {/* followup */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm shrink-0">🔔</div>
          <div className="flex-1 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-purple-700">FOLLOW-UP</p>
            <p className="text-[10px] text-gray-700">Send discount code — SAVE20</p>
          </div>
        </div>
        <div className="ml-4 w-px h-4 bg-gray-300" />
        {/* assign agent */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm shrink-0">👤</div>
          <div className="flex-1 bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">
            <p className="text-[9px] font-bold text-pink-700">ASSIGN AGENT</p>
            <p className="text-[10px] text-gray-700">Hand-off to Sales team</p>
          </div>
        </div>
      </div>
      <button className="w-full mt-3 py-2 rounded-xl text-[10px] font-bold border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors">
        + Add Step
      </button>
    </div>
  </div>
)

const InboxUI = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ width: 340 }}>
    <div className="flex h-64">
      {/* sidebar */}
      <div className="w-40 border-r border-gray-100 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Conversations</p>
          <div className="flex gap-1 mt-1">
            {['All','Mine','Open'].map((f,i)=>(
              <span key={f} className={`text-[8px] px-2 py-0.5 rounded-full font-semibold ${i===0?'bg-purple-100 text-purple-700':'text-gray-400'}`}>{f}</span>
            ))}
          </div>
        </div>
        {[
          {name:'Priya S.',msg:'Kab milega?',time:'2m',unread:3,color:'#7B2FBE'},
          {name:'Rahul M.',msg:'Payment done ✓',time:'5m',unread:0,color:'#25D366'},
          {name:'Neha K.',msg:'Bulk price?',time:'12m',unread:1,color:'#4A6CF7'},
          {name:'Amit P.',msg:'Cancel order',time:'1h',unread:0,color:'#E91E8C'},
        ].map(({name,msg,time,unread,color},i)=>(
          <div key={name} className={`px-3 py-2 border-b border-gray-50 cursor-pointer ${i===0?'bg-purple-50':''}`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[8px] font-bold shrink-0" style={{background:color}}>{name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-[9px] font-bold text-gray-700 truncate">{name}</p>
                  <p className="text-[7px] text-gray-400 shrink-0">{time}</p>
                </div>
                <p className="text-[8px] text-gray-400 truncate">{msg}</p>
              </div>
              {unread>0&&<span className="w-3.5 h-3.5 rounded-full bg-green-500 text-white text-[7px] flex items-center justify-center font-bold shrink-0">{unread}</span>}
            </div>
          </div>
        ))}
      </div>
      {/* chat */}
      <div className="flex-1 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px] font-bold">P</div>
          <div>
            <p className="text-[9px] font-bold text-gray-700">Priya Sharma</p>
            <p className="text-[7px] text-green-500">● Online</p>
          </div>
        </div>
        <div className="flex-1 p-2 space-y-1.5 overflow-hidden" style={{background:'#ECE5DD'}}>
          <div className="bg-white rounded-xl rounded-tl-none px-2.5 py-1.5 max-w-[85%] shadow-sm">
            <p className="text-[8px] text-gray-700">Kab milega delivery? 😊</p>
          </div>
          <div className="flex justify-end">
            <div className="rounded-xl rounded-tr-none px-2.5 py-1.5 max-w-[85%] shadow-sm" style={{background:'#DCF8C6'}}>
              <p className="text-[8px] text-gray-800">2-3 days mein milega! 📦</p>
              <span className="text-blue-500 text-[8px] float-right">✓✓</span>
            </div>
          </div>
        </div>
        <div className="px-2 py-1.5 border-t border-gray-100 flex gap-1">
          <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1 text-[8px] text-gray-400">Type a message...</div>
          <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
            <span className="text-white text-[8px]">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const AnalyticsUI = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ width: 320 }}>
    <div className="px-4 py-3 border-b border-gray-100">
      <p className="text-xs font-bold text-gray-700">📊 Campaign Analytics</p>
      <p className="text-[9px] text-gray-400">Diwali Sale 2024 — Last 7 days</p>
    </div>
    <div className="p-4">
      {/* Funnel */}
      {[
        {l:'Sent',v:'12,450',pct:100,c:'#7B2FBE'},
        {l:'Delivered',v:'12,201',pct:98,c:'#4A6CF7'},
        {l:'Read',v:'11,224',pct:90,c:'#25D366'},
        {l:'Replied',v:'3,734',pct:30,c:'#E91E8C'},
        {l:'Converted',v:'1,245',pct:10,c:'#F59E0B'},
      ].map(({l,v,pct,c})=>(
        <div key={l} className="mb-2">
          <div className="flex justify-between mb-0.5">
            <span className="text-[9px] text-gray-500 font-medium">{l}</span>
            <div className="flex gap-2">
              <span className="text-[9px] font-bold" style={{color:c}}>{v}</span>
              <span className="text-[9px] text-gray-300">{pct}%</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:c}}/>
          </div>
        </div>
      ))}
      {/* bar chart */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[9px] font-bold text-gray-500 mb-2">Daily Messages Sent</p>
        <div className="flex items-end gap-1.5 h-12">
          {[55,70,60,90,80,95,88].map((h,i)=>(
            <div key={i} className="flex-1 rounded-t" style={{height:`${h}%`,background:['#7B2FBE','#4A6CF7','#E91E8C','#7B2FBE','#4A6CF7','#E91E8C','#7B2FBE'][i],opacity:0.85}}/>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['M','T','W','T','F','S','S'].map(d=>(
            <span key={d} className="text-[7px] text-gray-400 flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 bg-purple-50 rounded-xl p-2 text-center">
          <p className="text-base font-extrabold font-jakarta" style={{color:'#7B2FBE'}}>₹2.4L</p>
          <p className="text-[8px] text-gray-400">Revenue</p>
        </div>
        <div className="flex-1 bg-green-50 rounded-xl p-2 text-center">
          <p className="text-base font-extrabold font-jakarta" style={{color:'#25D366'}}>6.2X</p>
          <p className="text-[8px] text-gray-400">ROAS</p>
        </div>
        <div className="flex-1 bg-blue-50 rounded-xl p-2 text-center">
          <p className="text-base font-extrabold font-jakarta" style={{color:'#4A6CF7'}}>90%</p>
          <p className="text-[8px] text-gray-400">Read Rate</p>
        </div>
      </div>
    </div>
  </div>
)

const UI_MAP = { broadcast: <BroadcastUI/>, chatbot: <ChatbotUI/>, inbox: <InboxUI/>, analytics: <AnalyticsUI/> }

/* ═══════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [openNav, setOpenNav] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    // Facebook's OAuth page severs window.opener on redirect back, so relay
    // via localStorage as the reliable path; postMessage is a fast-path bonus.
    localStorage.setItem('fb_oauth_code', JSON.stringify({ code, ts: Date.now() }))

    if (window.opener) {
      try { window.opener.postMessage({ type: 'FB_OAUTH_CODE', code }, window.location.origin) } catch (_) {}
      window.close()
    } else {
      window.location.replace('/settings')
    }
  }, [])

  return (
    <div className="min-h-screen bg-white font-dm text-gray-900 overflow-x-hidden">
      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .fu1{animation:fadeUp .6s ease .1s both}
        .fu2{animation:fadeUp .6s ease .25s both}
        .fu3{animation:fadeUp .6s ease .4s both}
        .fu4{animation:fadeUp .6s ease .55s both}
        .live{animation:pulse-dot 1.6s ease infinite}
        .nav-dropdown{display:none;position:absolute;top:100%;left:0;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:12px;min-width:220px;box-shadow:0 20px 60px rgba(0,0,0,0.1);z-index:100}
        .nav-item:hover .nav-dropdown{display:block}
      `}</style>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100" style={{boxShadow:'0 1px 20px rgba(0,0,0,0.06)'}}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/adswadi-logo.png" alt="Adswadi" className="w-9 h-9 object-contain" />
            <div>
              <span className="font-extrabold text-lg font-jakarta leading-none block" style={{background:'linear-gradient(90deg,#7B2FBE,#4A6CF7,#E91E8C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Adswadi</span>
              <span className="text-[9px] font-bold tracking-widest block" style={{color:'#7B2FBE'}}>WhatsApp API</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({label, sub}) => (
              <div key={label} className="nav-item relative">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                  {label} {sub && <ChevronDown size={13} className="text-gray-400"/>}
                </button>
                {sub && (
                  <div className="nav-dropdown">
                    {sub.map(s => (
                      <a key={s} href="#" className="block px-3 py-2 text-sm text-gray-600 hover:text-brand-purple hover:bg-purple-50 rounded-lg transition-all">{s}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/login" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link to="/register">
              <button className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all hover:opacity-90 shadow-md" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>
                Start for FREE
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="pt-16" style={{background:'linear-gradient(160deg,#F5EEFF 0%,#EEF2FF 40%,#fff 80%)'}}>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-0">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left text */}
            <div className="pb-16">
              <div className="inline-flex items-center gap-2 bg-white border border-purple-200 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-purple mb-6 shadow-sm fu1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 live inline-block"/>
                210,000+ businesses worldwide trust us
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold font-jakarta leading-[1.08] text-gray-900 mb-6 fu2">
                5X Your Revenue
                <span className="block" style={{background:'linear-gradient(90deg,#7B2FBE,#4A6CF7,#E91E8C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  with WhatsApp
                </span>
              </h1>

              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg fu3">
                Broadcast, Automate, Engage, Grow with Adswadi — India's most powerful WhatsApp Marketing Platform. Officially powered by Meta WhatsApp Business API.
              </p>

              <div className="flex flex-wrap gap-3 mb-10 fu4">
                <Link to="/register">
                  <button className="flex items-center gap-2 font-bold text-white px-8 py-4 rounded-2xl shadow-lg text-base hover:opacity-90 transition-all" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>
                    Start 14-Day FREE Trial <ArrowRight size={18}/>
                  </button>
                </Link>
                <button className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-6 py-4 rounded-2xl border border-gray-200 hover:border-brand-purple hover:text-brand-purple transition-all text-sm shadow-sm">
                  <Play size={15} style={{color:'#7B2FBE'}}/> Join Live Demo
                </button>
              </div>

              {/* trust badges */}
              <div className="flex flex-wrap gap-4 fu4">
                {[
                  {icon:'🏆', text:'Meta Official Partner'},
                  {icon:'🔒', text:'End-to-End Encrypted'},
                  {icon:'⚡', text:'Setup in 10 Minutes'},
                  {icon:'🇮🇳', text:'Indian Support Team'},
                ].map(({icon, text}) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — girl + platform mockup */}
            <div className="relative hidden md:flex items-end justify-center" style={{minHeight:480}}>
              {/* platform dashboard mockup */}
              <div className="absolute right-0 top-8 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden" style={{width:340, zIndex:10}}>
                {/* browser bar */}
                <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"/><div className="w-2.5 h-2.5 rounded-full bg-green-400"/></div>
                  <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-gray-400">app.adswadi.com</div>
                </div>
                {/* sidebar + content */}
                <div className="flex" style={{height:320}}>
                  <div className="w-28 flex flex-col p-2 gap-1" style={{background:'#1A0A2E'}}>
                    {['📊 Dashboard','💬 Inbox','📤 Campaigns','👥 Contacts','🤖 Flows','📈 Analytics'].map((item,i)=>(
                      <div key={item} className="text-[8px] px-2 py-1.5 rounded-lg" style={i===1?{background:'#7B2FBE',color:'white'}:{color:'rgba(255,255,255,0.5)'}}>{item}</div>
                    ))}
                  </div>
                  <div className="flex-1 p-3 bg-gray-50 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {[{l:'Messages',v:'4.8K',c:'#7B2FBE'},{l:'Read Rate',v:'92%',c:'#25D366'},{l:'Replied',v:'1.2K',c:'#4A6CF7'},{l:'Revenue',v:'₹1.2L',c:'#E91E8C'}].map(({l,v,c})=>(
                        <div key={l} className="bg-white rounded-lg p-2 border-l-2" style={{borderColor:c}}>
                          <p className="text-[7px] text-gray-400">{l}</p>
                          <p className="text-xs font-extrabold font-jakarta" style={{color:c}}>{v}</p>
                        </div>
                      ))}
                    </div>
                    {/* mini chart */}
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[7px] text-gray-500 mb-1.5">Campaign Performance</p>
                      <div className="flex items-end gap-1 h-10">
                        {[50,70,55,85,75,95,80].map((h,i)=>(
                          <div key={i} className="flex-1 rounded-t" style={{height:`${h}%`,background:['#7B2FBE','#4A6CF7','#E91E8C','#7B2FBE','#4A6CF7','#E91E8C','#25D366'][i],opacity:.8}}/>
                        ))}
                      </div>
                    </div>
                    {/* live conversations */}
                    <div className="bg-white rounded-lg p-2">
                      <p className="text-[7px] font-bold text-gray-500 mb-1">💬 Live Inbox</p>
                      {[{n:'Priya S.',m:'Kab aayega?',u:3},{n:'Rahul M.',m:'Thanks! 🙏',u:0},{n:'Amit K.',m:'Bulk price?',u:1}].map(({n,m,u})=>(
                        <div key={n} className="flex items-center gap-1.5 py-1 border-b border-gray-50 last:border-0">
                          <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[6px] font-bold shrink-0">{n[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[7px] font-bold truncate text-gray-700">{n}</p>
                            <p className="text-[6px] text-gray-400 truncate">{m}</p>
                          </div>
                          {u>0&&<span className="w-3 h-3 rounded-full bg-green-500 text-white text-[6px] flex items-center justify-center">{u}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Girl photo — overlapping left side */}
              <div className="absolute left-0 bottom-0 z-20">
                <div className="absolute bottom-0 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none" style={{background:'radial-gradient(circle,#7B2FBE,#E91E8C,transparent)'}}/>
                <img
                  src="/hero-girl.jpg"
                  alt="WhatsApp Marketing Expert"
                  style={{
                    width:260, height:400,
                    objectFit:'cover',
                    objectPosition:'top center',
                    borderRadius:'130px 130px 0 0',
                    filter:'drop-shadow(0 16px 32px rgba(123,47,190,0.2))',
                    mixBlendMode:'multiply',
                    position:'relative',
                    zIndex:20,
                  }}
                  onError={e=>{
                    e.target.src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&crop=top'
                    e.target.style.mixBlendMode='normal'
                  }}
                />
              </div>

              {/* Floating stat chips */}
              <div className="absolute top-6 left-4 bg-white rounded-2xl shadow-lg px-4 py-3 z-30 border border-gray-100" style={{animation:'fadeIn 1s ease 0.8s both'}}>
                <p className="text-xl font-extrabold font-jakarta" style={{color:'#25D366'}}>98%</p>
                <p className="text-[9px] text-gray-400 font-medium">Open Rate</p>
              </div>
              <div className="absolute top-32 left-2 bg-white rounded-2xl shadow-lg px-4 py-3 z-30 border border-gray-100" style={{animation:'fadeIn 1s ease 1s both'}}>
                <p className="text-xl font-extrabold font-jakarta" style={{color:'#7B2FBE'}}>5X</p>
                <p className="text-[9px] text-gray-400 font-medium">ROAS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CLIENT LOGOS MARQUEE
      ══════════════════════════════════════════ */}
      <section className="py-10 border-y border-gray-100 bg-white overflow-hidden">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Trusted by 10,000+ Indian businesses</p>
        <LogoMarquee/>
      </section>

      {/* ══════════════════════════════════════════
          WHY WHATSAPP — Stats
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{background:'linear-gradient(135deg,#1A0A2E,#2D1255)'}}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-purple-300 uppercase mb-3">Why WhatsApp?</p>
            <h2 className="text-4xl font-extrabold font-jakarta text-white mb-4">Duniya ka sabse powerful marketing channel</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Email se 5X zyada open rate. Social media se 10X zyada engagement. WhatsApp wins every time.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {WHATSAPP_STATS.map(({value, label, sub}) => (
              <div key={label} className="text-center p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all" style={{background:'rgba(255,255,255,0.05)'}}>
                <p className="text-4xl font-extrabold font-jakarta mb-1" style={{background:'linear-gradient(90deg,#7B2FBE,#4A6CF7,#E91E8C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{value}</p>
                <p className="text-white font-bold text-sm mb-1">{label}</p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — alternating layout (AiSensy style)
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <p className="text-xs font-bold tracking-widest text-brand-purple uppercase mb-3">Core Features</p>
            <h2 className="text-4xl font-extrabold font-jakarta text-gray-900">Sab kuch ek platform mein</h2>
          </div>

          {/* Feature tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 mb-12">
            {FEATURES.map(({tag}, i) => (
              <button key={i} onClick={() => setActiveFeature(i)}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                style={activeFeature===i
                  ? {background:FEATURES[i].color,color:'white',boxShadow:`0 4px 20px ${FEATURES[i].color}40`}
                  : {background:'white',color:'#6B7280',border:'1px solid #E5E7EB'}}>
                {tag}
              </button>
            ))}
          </div>

          {/* Active feature */}
          {FEATURES.map(({headline, sub, points, color, ui}, i) => (
            <div key={i} className={`grid md:grid-cols-2 gap-12 items-center transition-all ${activeFeature===i ? 'block' : 'hidden'}`}>
              <div>
                <h3 className="text-3xl font-extrabold font-jakarta text-gray-900 mb-4 leading-tight">{headline}</h3>
                <p className="text-gray-500 mb-6 text-lg leading-relaxed">{sub}</p>
                <ul className="space-y-3">
                  {points.map(p => (
                    <li key={p} className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{background:color}}>
                        <CheckCircle size={12} className="text-white"/>
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <button className="mt-8 flex items-center gap-2 font-bold text-white px-6 py-3 rounded-xl text-sm" style={{background:color}}>
                    Free mein try karo <ArrowRight size={16}/>
                  </button>
                </Link>
              </div>
              <div className="flex justify-center">
                {UI_MAP[ui]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ADVANCED FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-brand-purple uppercase mb-3">Advanced Features</p>
            <h2 className="text-4xl font-extrabold font-jakarta text-gray-900">Sirf messaging nahi — puri business</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {ADVANCED.map(({emoji, title, desc}) => (
              <div key={title} className="group p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-200 hover:-translate-y-1 transition-all cursor-pointer bg-white">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{emoji}</div>
                <h3 className="font-bold text-gray-900 font-jakarta mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FREE BENEFITS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{background:'linear-gradient(135deg,#F5EEFF,#EEF2FF)'}}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-brand-purple uppercase mb-3">Free ke saath milega</p>
            <h2 className="text-3xl font-extrabold font-jakarta text-gray-900 mb-8">Start karo — kuch bhi pay mat karo</h2>
            <ul className="space-y-4">
              {FREE_BENEFITS.map(b => (
                <li key={b} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{background:'#25D366'}}>
                    <CheckCircle size={14} className="text-white"/>
                  </div>
                  {b}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <button className="mt-8 flex items-center gap-2 font-bold text-white px-8 py-4 rounded-2xl shadow-lg text-base hover:opacity-90 transition-all" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>
                Abhi Start Karo — It's FREE <ArrowRight size={18}/>
              </button>
            </Link>
          </div>
          {/* right: phone with WA chat */}
          <div className="relative flex justify-center">
            <div className="bg-gray-900 rounded-[40px] p-2 shadow-2xl" style={{width:240,boxShadow:'0 40px 80px rgba(0,0,0,0.25)'}}>
              <div className="rounded-[32px] overflow-hidden" style={{background:'#ECE5DD'}}>
                <div className="flex items-center gap-2 px-3 py-2" style={{background:'#075E54'}}>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                  <div>
                    <p className="text-white text-[10px] font-bold">Adswadi Bot</p>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 live"/><span className="text-white/60 text-[8px]">online</span></div>
                  </div>
                </div>
                <div className="p-3 space-y-2" style={{minHeight:320}}>
                  <div className="text-center"><span className="text-[8px] bg-white/60 text-gray-500 px-2 py-0.5 rounded-full">Today</span></div>
                  {[
                    {type:'in', msg:'Hi! Price list milegi?'},
                    {type:'out', msg:'Namaste! 👋\nHaan bilkul, ye dekho 👇'},
                    {type:'in', msg:'Starter plan le lun?'},
                    {type:'out', msg:'Great choice! ₹999/month mein 5,000 conversations + 3 agents. Shuru karein? 🚀'},
                    {type:'cta', msg:'💳 Plan Subscribe Karo'},
                    {type:'in', msg:'Payment done! Thanks 🙏'},
                    {type:'out', msg:'Welcome to Adswadi! 🎉\nAapka account ready hai ✅'},
                  ].map(({type, msg}, idx) => type==='cta' ? (
                    <div key={idx} className="mx-auto max-w-[90%] bg-white rounded-xl py-1.5 text-center border border-gray-200">
                      <p className="text-[9px] font-bold text-teal-600">{msg}</p>
                    </div>
                  ) : type==='in' ? (
                    <div key={idx} className="bg-white rounded-xl rounded-tl-none px-2.5 py-1.5 max-w-[88%] shadow-sm">
                      <p className="text-[9px] text-gray-800 whitespace-pre-line">{msg}</p>
                    </div>
                  ) : (
                    <div key={idx} className="flex justify-end">
                      <div className="rounded-xl rounded-tr-none px-2.5 py-1.5 max-w-[85%] shadow-sm" style={{background:'#DCF8C6'}}>
                        <p className="text-[9px] text-gray-800 whitespace-pre-line">{msg}</p>
                        <span className="text-blue-500 text-[8px] float-right mt-0.5">✓✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-brand-purple uppercase text-center mb-3">Customer Love</p>
          <h2 className="text-4xl font-extrabold font-jakarta text-gray-900 text-center mb-14">10,000+ businesses ka bharosa</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({quote, name, title, company, avatar, rating}) => (
              <div key={name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {Array(rating).fill(0).map((_,i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400"/>)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>{avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{title}, {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════ */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-brand-purple uppercase text-center mb-3">Pricing</p>
          <h2 className="text-4xl font-extrabold font-jakarta text-gray-900 text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-500 mb-12">Free se shuru karo. Grow karte karo. Indian Rupees mein pricing.</p>
          <div className="grid md:grid-cols-4 gap-5">
            {PLANS.map(({name, price, mo, tag, color, features}) => (
              <div key={name} className={`rounded-2xl p-6 bg-white relative ${tag ? 'ring-2 shadow-xl scale-[1.04]' : 'border border-gray-100 shadow-sm'}`} style={tag?{ringColor:color,boxShadow:`0 20px 60px ${color}20`}:{}}>
                {tag && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{background:`linear-gradient(90deg,${color},#E91E8C)`}}>🔥 {tag}</span>}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-extrabold font-jakarta text-gray-900">{price}</span>
                  <span className="text-xs text-gray-400">{mo}</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-5">+Meta WhatsApp charges</p>
                <ul className="space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle size={12} className="mt-0.5 shrink-0" style={{color:tag?color:'#25D366'}}/> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 ${tag?'text-white':'border border-gray-200 text-gray-600 hover:border-gray-400'}`} style={tag?{background:`linear-gradient(135deg,${color},#E91E8C)`}:{}}>
                    {name==='Free'?'Get Started':name==='Enterprise'?'Contact Sales':'Start Free Trial'}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          QUICK START
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-brand-purple uppercase text-center mb-3">Quick Start</p>
          <h2 className="text-4xl font-extrabold font-jakarta text-gray-900 text-center mb-14">10 minute mein shuru karo</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {step:'01', icon:'📝', title:'Register karo', desc:'Free account banao — no credit card'},
              {step:'02', icon:'📱', title:'WA Connect karo', desc:'Meta Business account link karo'},
              {step:'03', icon:'📋', title:'Template approve karo', desc:'Ready templates library se select karo'},
              {step:'04', icon:'🚀', title:'Campaign launch karo', desc:'Contacts import karo aur bhejo!'},
            ].map(({step,icon,title,desc}) => (
              <div key={step} className="relative">
                <div className="text-5xl font-extrabold font-jakarta text-gray-100 mb-2">{step}</div>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-gray-900 font-jakarta mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register">
              <button className="inline-flex items-center gap-2 font-bold text-white px-10 py-4 rounded-2xl shadow-xl text-lg hover:opacity-90 transition-all" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>
                Abhi Start Karo — Free hai! <ArrowRight size={20}/>
              </button>
            </Link>
            <p className="text-gray-400 text-sm mt-3">10,000+ businesses already using Adswadi 🚀</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-brand-purple uppercase text-center mb-3">FAQ</p>
          <h2 className="text-4xl font-extrabold font-jakarta text-gray-900 text-center mb-12">Aapke sawaal, hamare jawab</h2>
          <div className="space-y-3">
            {FAQS.map(({q,a},i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                  <span className="font-semibold text-gray-800 text-sm">{q}</span>
                  <ChevronDown size={18} className="text-gray-400 transition-transform shrink-0 ml-4" style={{transform:openFaq===i?'rotate(180deg)':'none'}}/>
                </button>
                {openFaq===i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden" style={{background:'linear-gradient(135deg,#1A0A2E,#2D1255)'}}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-20" style={{background:'#7B2FBE'}}/>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full blur-3xl opacity-15" style={{background:'#E91E8C'}}/>
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-4">Start WhatsApp Marketing in 10 Minutes</p>
          <h2 className="text-5xl font-extrabold font-jakarta text-white mb-6">
            Aaj hi 5X karo apna<br/>
            <span style={{background:'linear-gradient(90deg,#7B2FBE,#4A6CF7,#E91E8C)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>WhatsApp Revenue</span>
          </h2>
          <p className="text-gray-400 mb-10 text-lg">10,000+ Indian businesses pehle se use kar rahe hain. Aap kab join karenge?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <button className="flex items-center gap-2 font-bold text-white px-10 py-4 rounded-2xl text-lg shadow-xl hover:opacity-90 transition-all" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>
                Start 14-Day FREE Trial <ArrowRight size={20}/>
              </button>
            </Link>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all border border-white/20">
              <Play size={16}/> Join Live Demo
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-6">✓ No credit card &nbsp; ✓ Free forever plan &nbsp; ✓ Indian 24/7 support</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/adswadi-logo.png" alt="Adswadi" className="w-8 h-8 object-contain" />
                <div>
                  <span className="font-extrabold text-white text-base font-jakarta block">Adswadi</span>
                  <span className="text-[9px] text-purple-400">WhatsApp API</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-4">India's most powerful WhatsApp Marketing Platform. Officially powered by Meta.</p>
              <p className="text-xs">📞 +91 8678830021</p>
              <p className="text-xs mt-1">📧 adswadiofficial@gmail.com</p>
            </div>

            {[
              { title:'Platform', links:['WhatsApp API','Bulk Broadcast','AI Chatbot','Live Inbox','Analytics','Pricing'] },
              { title:'Industries', links:['E-commerce','Education','Finance','Healthcare','Real Estate','Events'] },
              { title:'Resources', links:['Help Center','Blog','API Docs','Case Studies','YouTube','Template Library'] },
              { title:'Company', links:[
                { label:'About Us', href:'/about' },
                { label:'Careers', href:'/careers' },
                { label:'Partner Program', href:'/partner-program' },
                { label:'Privacy Policy', href:'/privacy' },
                { label:'Terms', href:'/terms' },
                { label:'Refund Policy', href:'/refund-policy' },
              ]},
            ].map(({title, links}) => (
              <div key={title}>
                <h4 className="text-white font-bold text-sm mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => {
                    const label = typeof l === 'string' ? l : l.label
                    const href = typeof l === 'string' ? '#' : l.href
                    return (
                      <li key={label}>
                        {href === '#' ? (
                          <a href="#" className="text-xs hover:text-white transition-colors">{label}</a>
                        ) : (
                          <Link to={href} className="text-xs hover:text-white transition-colors">{label}</Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2024 Adswadi. Made with ❤️ in India 🇮🇳</p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">🏆 Meta Business Partner</span>
              <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">🔒 ISO 27001</span>
              <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">⭐ G2 Leader 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
