import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4A6CF7)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 font-jakarta">Adswadi WhatsApp API</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={26} className="text-green-500" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 font-jakarta mb-2">Check your email</h1>
              <p className="text-gray-500 text-sm mb-6">
                If an account exists for <span className="font-semibold">{email}</span>, a reset link has been sent. It expires in 1 hour.
              </p>
              <Link to="/login" className="text-sm font-semibold text-brand-purple hover:underline">Back to login</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-1">Forgot password?</h1>
                <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={16} />}
                />

                <Button type="submit" variant="gradient" className="w-full" size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm font-semibold text-brand-purple hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
