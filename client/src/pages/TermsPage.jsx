import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
)

const TermsPage = () => (
  <div className="min-h-screen bg-white font-jakarta">
    <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <Link to="/" className="flex items-center gap-2">
        <img src="/adswadi-logo.png" alt="Adswadi" className="w-8 h-8 object-contain" />
        <span className="font-extrabold text-gray-900 text-base">Adswadi</span>
      </Link>
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
    </nav>

    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Terms of Service</h1>
        <p className="text-sm text-gray-400">Last updated: June 1, 2025</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5 mb-10 text-sm text-yellow-800">
        Please read these terms carefully before using Adswadi. By using our platform, you agree to these terms.
      </div>

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using Adswadi ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>Adswadi provides a WhatsApp Business API platform that allows businesses to send messages, run campaigns, automate customer communications, and manage WhatsApp inboxes. We are an official Meta Business Partner.</p>
      </Section>

      <Section title="3. Eligibility">
        <p>You must be at least 18 years old and represent a legitimate business to use our services. By registering, you confirm that all information you provide is accurate and truthful.</p>
      </Section>

      <Section title="4. WhatsApp & Meta Compliance">
        <p>By using our platform, you agree to comply with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>WhatsApp Business Policy</li>
          <li>Meta Platform Terms</li>
          <li>WhatsApp Commerce Policy</li>
        </ul>
        <p>You are solely responsible for the content of messages sent through our platform. Adswadi reserves the right to suspend accounts that violate WhatsApp policies.</p>
      </Section>

      <Section title="5. Prohibited Uses">
        <p>You may not use Adswadi to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Send spam or unsolicited messages</li>
          <li>Promote illegal products or services</li>
          <li>Harass or threaten individuals</li>
          <li>Send misleading or fraudulent content</li>
          <li>Violate any applicable law or regulation</li>
          <li>Resell our services without authorization</li>
        </ul>
      </Section>

      <Section title="6. Account Responsibilities">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at <a href="mailto:adswadiofficial@gmail.com" className="text-purple-600 underline">adswadiofficial@gmail.com</a> if you suspect unauthorized access.</p>
      </Section>

      <Section title="7. Subscription & Billing">
        <p>Paid plans are billed in advance on a monthly or annual basis. All fees are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise. We reserve the right to change pricing with 30 days' notice.</p>
      </Section>

      <Section title="8. Intellectual Property">
        <p>All content, trademarks, and software on the Adswadi platform are the exclusive property of Adswadi. You may not copy, modify, or distribute our intellectual property without written permission.</p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>Adswadi shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you in the last 3 months.</p>
      </Section>

      <Section title="10. Termination">
        <p>We may suspend or terminate your account for violations of these terms, with or without notice. You may cancel your account at any time from the billing settings.</p>
      </Section>

      <Section title="11. Governing Law">
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Delhi, India.</p>
      </Section>

      <Section title="12. Contact">
        <p>📧 <a href="mailto:adswadiofficial@gmail.com" className="text-purple-600 underline">adswadiofficial@gmail.com</a></p>
        <p>📞 +91 8678830021</p>
      </Section>
    </div>

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default TermsPage
