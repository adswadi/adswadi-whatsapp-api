import { Link } from 'react-router-dom'

const jobs = [
  {
    title: 'Full Stack Developer',
    type: 'Full-time · Remote',
    location: 'India',
    desc: 'Build and scale our WhatsApp marketing platform using React, Node.js, and MongoDB.',
    tags: ['React', 'Node.js', 'MongoDB', 'Socket.io'],
  },
  {
    title: 'Growth Marketing Manager',
    type: 'Full-time · Remote',
    location: 'India',
    desc: 'Drive user acquisition and retention strategies for Adswadi across India.',
    tags: ['Performance Marketing', 'SEO', 'Content', 'Analytics'],
  },
  {
    title: 'Customer Success Executive',
    type: 'Full-time · Remote',
    location: 'India',
    desc: 'Help businesses onboard and get maximum value from our WhatsApp API platform.',
    tags: ['Customer Support', 'WhatsApp', 'Onboarding', 'SaaS'],
  },
]

const CareersPage = () => (
  <div className="min-h-screen bg-white font-jakarta">
    <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}>
          <svg viewBox="0 0 32 32" fill="white" className="w-4 h-4"><path d="M16 2C8.268 2 2 8.268 2 16c0 2.637.693 5.113 1.906 7.25L2 30l6.938-1.875A13.942 13.942 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"/></svg>
        </div>
        <span className="font-extrabold text-gray-900 text-base">Adswadi</span>
      </Link>
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
    </nav>

    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">We're Hiring</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Join the Adswadi Team</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Help us build India's most powerful WhatsApp marketing platform. We're a fast-growing, remote-first team.</p>
      </div>

      {/* Why work with us */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {[
          { icon: '🏠', title: 'Remote First', desc: 'Work from anywhere in India. We believe in flexibility and work-life balance.' },
          { icon: '📈', title: 'Fast Growth', desc: 'We\'re growing 3x year-over-year. Your career grows with the company.' },
          { icon: '💰', title: 'Competitive Pay', desc: 'Market-competitive salaries with performance bonuses and ESOPs for senior roles.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="p-6 border border-gray-100 rounded-2xl text-center">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Open Positions */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
      <div className="space-y-4 mb-14">
        {jobs.map(({ title, type, location, desc, tags }) => (
          <div key={title} className="border border-gray-100 rounded-2xl p-6 hover:border-purple-200 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{type} · {location}</p>
              </div>
              <a
                href={`mailto:adswadiofficial@gmail.com?subject=Application for ${title}`}
                className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all"
                style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}
              >
                Apply Now
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-3 mb-4">{desc}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generic apply */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-3xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Don't See a Fit?</h2>
        <p className="text-white/80 mb-6">We're always looking for talented people. Send us your resume and we'll keep you in mind.</p>
        <a
          href="mailto:adswadiofficial@gmail.com?subject=General Application"
          className="inline-block bg-white text-purple-700 font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
        >
          📧 adswadiofficial@gmail.com
        </a>
      </div>
    </div>

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default CareersPage
