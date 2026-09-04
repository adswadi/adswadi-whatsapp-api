import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Zap, Lock, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return toast.error('Missing or invalid reset link')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return toast.error('Password must include upper, lower, number & special character')
    }
    if (password !== confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src="/adswadi-logo.png" alt="Adswadi" className="w-8 h-8 object-contain" />
          <span className="font-bold text-gray-900 font-jakarta">Adswadi WhatsApp API</span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-1">Set a new password</h1>
            <p className="text-gray-500 text-sm">Choose a new password for your account</p>
          </div>

          {!token ? (
            <p className="text-sm text-red-500">This reset link is invalid. Please request a new one.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-gray-700">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                leftIcon={<Lock size={16} />}
              />

              <Button type="submit" variant="gradient" className="w-full" size="lg" loading={loading}>
                Reset Password
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-brand-purple hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
