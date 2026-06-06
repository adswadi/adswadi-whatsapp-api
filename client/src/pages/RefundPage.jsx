import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
)

const RefundPage = () => (
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Refund Policy</h1>
        <p className="text-sm text-gray-400">Last updated: June 1, 2025</p>
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-10 text-sm text-green-800">
        We want you to be completely satisfied with Adswadi. If you're not happy, we're here to help.
      </div>

      <Section title="1. 7-Day Money-Back Guarantee">
        <p>If you are not satisfied with Adswadi for any reason, you may request a full refund within <strong>7 days</strong> of your initial subscription payment. This applies to first-time subscribers on any paid plan.</p>
        <p>To request a refund, email us at <a href="mailto:billing@adswadi.com" className="text-purple-600 underline">billing@adswadi.com</a> with your registered email and reason for refund.</p>
      </Section>

      <Section title="2. Eligibility for Refunds">
        <p>Refunds are applicable if:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You are a first-time subscriber and request within 7 days of payment</li>
          <li>There is a technical issue on our end that prevents you from using the service</li>
          <li>You were charged incorrectly (duplicate payment, wrong amount)</li>
        </ul>
      </Section>

      <Section title="3. Non-Refundable Cases">
        <p>The following are not eligible for refunds:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Renewal charges after the initial subscription period</li>
          <li>Partial month usage after cancellation</li>
          <li>WhatsApp conversation charges (these are billed by Meta and passed through)</li>
          <li>Accounts suspended due to policy violations</li>
          <li>Add-on purchases (extra contacts, extra numbers)</li>
        </ul>
      </Section>

      <Section title="4. WhatsApp Conversation Credits">
        <p>WhatsApp conversation charges are determined by Meta and vary based on message type and country. These charges are <strong>non-refundable</strong> once messages have been delivered, as they are directly billed by Meta.</p>
      </Section>

      <Section title="5. Cancellation Policy">
        <p>You can cancel your subscription at any time from Settings → Billing. Your access will continue until the end of the current billing period. We do not provide pro-rated refunds for unused days in the billing cycle.</p>
      </Section>

      <Section title="6. Refund Process">
        <p>Once your refund request is approved:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Refunds are processed within <strong>5-7 business days</strong></li>
          <li>Credit will appear in your original payment method</li>
          <li>For UPI/Net Banking: 3-5 business days</li>
          <li>For Credit/Debit Cards: 5-7 business days</li>
        </ul>
      </Section>

      <Section title="7. How to Request a Refund">
        <p>Email <a href="mailto:billing@adswadi.com" className="text-purple-600 underline">billing@adswadi.com</a> with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your registered email address</li>
          <li>Payment transaction ID</li>
          <li>Reason for refund request</li>
        </ul>
        <p>Our team will respond within 24 business hours.</p>
      </Section>

      <Section title="8. Contact">
        <p>📧 <a href="mailto:billing@adswadi.com" className="text-purple-600 underline">billing@adswadi.com</a></p>
        <p>📞 +91 98739 40683 (Mon–Sat, 10am–6pm IST)</p>
      </Section>
    </div>

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default RefundPage
