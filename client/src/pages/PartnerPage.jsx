import { Link } from 'react-router-dom'

const PartnerPage = () => (
  <div className="min-h-screen bg-white font-jakarta">
    <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <Link to="/" className="flex items-center gap-2">
        <img src="/adswadi-logo.png" alt="Adswadi" className="w-8 h-8 object-contain" />
        <span className="font-extrabold text-gray-900 text-base">Adswadi</span>
      </Link>
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
    </nav>

    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Partner Program</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Grow Together with Adswadi</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Join our partner ecosystem and earn recurring commissions while helping businesses unlock the power of WhatsApp marketing.</p>
      </div>

      {/* Partner types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: '🤝',
            title: 'Reseller Partner',
            desc: 'Resell Adswadi under your brand. Get white-label access and dedicated support.',
            perks: ['Up to 40% margin', 'White-label dashboard', 'Dedicated account manager', 'Priority support'],
          },
          {
            icon: '💼',
            title: 'Agency Partner',
            desc: 'Manage multiple client accounts. Perfect for digital marketing agencies.',
            perks: ['Multi-client dashboard', '20% recurring commission', 'Agency training & resources', 'Co-marketing opportunities'],
            highlight: true,
          },
          {
            icon: '🔗',
            title: 'Referral Partner',
            desc: 'Refer businesses to Adswadi and earn commission on every successful signup.',
            perks: ['15% recurring commission', 'Unique referral link', 'Real-time earnings dashboard', 'Monthly payouts'],
          },
        ].map(({ icon, title, desc, perks, highlight }) => (
          <div key={title} className={`rounded-3xl p-8 border ${highlight ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : 'border-gray-100'}`}>
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{desc}</p>
            <ul className="space-y-2">
              {perks.map(p => (
                <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Apply', desc: 'Fill out the partner application form below.' },
            { step: '02', title: 'Onboard', desc: 'Get trained on the platform and receive your partner kit.' },
            { step: '03', title: 'Refer or Resell', desc: 'Start bringing clients on board using your unique link or dashboard.' },
            { step: '04', title: 'Earn', desc: 'Receive recurring commissions every month directly to your bank.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center p-6">
              <div className="text-3xl font-extrabold text-purple-200 mb-2">{step}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-900 text-white rounded-3xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Partner with Adswadi?</h2>
        <p className="text-gray-400 mb-6">Join 500+ partners already earning with us. Apply today and our team will reach out within 24 hours.</p>
        <a
          href="mailto:adswadiofficial@gmail.com?subject=Partner Program Application"
          className="inline-block font-bold px-8 py-3 rounded-xl text-sm transition-all"
          style={{background:'linear-gradient(135deg,#7B2FBE,#E91E8C)'}}
        >
          Apply to Partner Program →
        </a>
        <p className="text-gray-500 text-xs mt-4">📧 adswadiofficial@gmail.com · 📞 +91 8678830021</p>
      </div>
    </div>

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default PartnerPage
