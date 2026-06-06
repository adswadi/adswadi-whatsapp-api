import { Link } from 'react-router-dom'

const AboutPage = () => (
  <div className="min-h-screen bg-white font-jakarta">
    {/* Nav */}
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
      {/* Hero */}
      <div className="text-center mb-16">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Our Story</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About Adswadi</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">India's most powerful WhatsApp Marketing Platform, officially powered by Meta.</p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed text-base">
          At Adswadi, we believe every business — from a small kirana store to a large enterprise — deserves access to powerful communication tools. Our mission is to democratize WhatsApp Business API, making it simple, affordable, and incredibly effective for Indian businesses to connect with their customers.
        </p>
      </div>

      {/* Story */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Started</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Adswadi was born out of a simple frustration — Indian businesses were missing out on WhatsApp's massive potential because existing solutions were either too expensive or too complicated. Our founders, with decades of combined experience in digital marketing and SaaS, set out to build a platform that truly understands the Indian market.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Today, we're a Meta Official Business Partner, serving thousands of businesses across India — helping them send bulk broadcasts, automate customer support with AI chatbots, and run highly targeted WhatsApp campaigns that actually convert.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { number: '10,000+', label: 'Active Businesses' },
          { number: '500M+', label: 'Messages Sent' },
          { number: '98%', label: 'Delivery Rate' },
          { number: '24/7', label: 'Support' },
        ].map(({ number, label }) => (
          <div key={label} className="text-center p-6 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-extrabold text-purple-600 mb-1">{number}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🤝', title: 'Customer First', desc: 'Every decision we make starts with the question — how does this help our customers grow?' },
            { icon: '🔒', title: 'Trust & Security', desc: 'We handle your customer data with the highest standards of security and compliance.' },
            { icon: '🚀', title: 'Innovation', desc: 'We continuously push the boundaries of what WhatsApp marketing can do for your business.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-6 border border-gray-100 rounded-2xl">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-900 text-white rounded-3xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
        <p className="text-gray-400 mb-6">Have questions? We'd love to hear from you.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:adswadiofficial@gmail.com" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">📧 adswadiofficial@gmail.com</a>
          <a href="tel:+918678830021" className="border border-gray-700 px-6 py-3 rounded-xl font-semibold text-sm hover:border-gray-500 transition-colors">📞 +91 8678830021</a>
        </div>
      </div>
    </div>

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default AboutPage
