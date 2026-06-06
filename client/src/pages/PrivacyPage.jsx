import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
)

const PrivacyPage = () => (
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

    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-400">Last updated: June 1, 2025</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-10 text-sm text-blue-800">
        Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights regarding your information.
      </div>

      <Section title="1. Information We Collect">
        <p><strong>Account Information:</strong> When you register, we collect your name, email address, phone number, and organization details.</p>
        <p><strong>Usage Data:</strong> We collect information about how you use our platform — including messages sent, campaigns created, and features accessed — to improve our services.</p>
        <p><strong>Customer Contact Data:</strong> When you import contacts or send WhatsApp messages via our platform, we process that data on your behalf as a data processor.</p>
        <p><strong>Payment Information:</strong> We use secure third-party payment processors (Razorpay). We do not store your credit/debit card details.</p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use collected information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and improve the Adswadi platform</li>
          <li>Send transactional emails and account notifications</li>
          <li>Process payments and manage subscriptions</li>
          <li>Provide customer support</li>
          <li>Comply with legal obligations</li>
          <li>Detect and prevent fraud or abuse</li>
        </ul>
      </Section>

      <Section title="3. WhatsApp & Meta Data">
        <p>Adswadi is an official Meta Business Partner. We access the WhatsApp Business API on your behalf. Messages you send through our platform are subject to Meta's WhatsApp Business Policy and Terms of Service.</p>
        <p>We do not read the content of messages sent between you and your customers beyond what is necessary to provide the service.</p>
      </Section>

      <Section title="4. Data Sharing">
        <p>We do not sell your personal data. We share data only with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Meta/Facebook:</strong> To facilitate WhatsApp API services</li>
          <li><strong>Payment Processors:</strong> Razorpay for billing</li>
          <li><strong>Infrastructure Providers:</strong> AWS, MongoDB Atlas for hosting</li>
          <li><strong>Legal Authorities:</strong> When required by law</li>
        </ul>
      </Section>

      <Section title="5. Data Security">
        <p>We implement industry-standard security measures including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>AES-256 encryption for sensitive data at rest</li>
          <li>TLS 1.3 for data in transit</li>
          <li>Access tokens are encrypted before storage</li>
          <li>Regular security audits</li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your account data for the duration of your subscription and for 90 days after account deletion, unless required longer by law. Message logs are retained for 30 days.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>To exercise these rights, email us at <a href="mailto:adswadiofficial@gmail.com" className="text-purple-600 underline">adswadiofficial@gmail.com</a></p>
      </Section>

      <Section title="8. Cookies">
        <p>We use essential cookies for authentication and session management. We do not use third-party advertising cookies.</p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>Our services are not directed to children under 18. We do not knowingly collect data from minors.</p>
      </Section>

      <Section title="10. Contact Us">
        <p>For privacy-related queries:</p>
        <p>📧 <a href="mailto:adswadiofficial@gmail.com" className="text-purple-600 underline">adswadiofficial@gmail.com</a></p>
        <p>📍 Adswadi, India</p>
      </Section>
    </div>

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default PrivacyPage
