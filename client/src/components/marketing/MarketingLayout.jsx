import { Link } from 'react-router-dom'

const MarketingLayout = ({ children }) => (
  <div className="min-h-screen bg-white font-jakarta">
    <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <Link to="/" className="flex items-center gap-2">
        <img src="/adswadi-logo.png" alt="Adswadi" className="w-8 h-8 object-contain" />
        <span className="font-extrabold text-gray-900 text-base">Adswadi</span>
      </Link>
      <div className="flex items-center gap-5">
        <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
        <Link to="/register" className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-transform hover:scale-105" style={{ background: 'linear-gradient(90deg,#7B2FBE,#4A6CF7)' }}>
          Start Free Trial
        </Link>
        <Link to="/" className="hidden md:block text-sm text-gray-400 hover:text-gray-900 transition-colors">← Back to Home</Link>
      </div>
    </nav>

    {children}

    <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Adswadi. Made with ❤️ in India 🇮🇳
    </footer>
  </div>
)

export default MarketingLayout
