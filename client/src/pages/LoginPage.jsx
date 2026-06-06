import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Lock, Mail } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left - Brand panel */}
      <div className="hidden md:flex flex-col justify-center px-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1B4E 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4A6CF7)' }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl font-jakarta">Adswadi WhatsApp API</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white font-jakarta leading-tight mb-4">
            Power up your<br />WhatsApp marketing
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            India's most powerful WhatsApp marketing platform trusted by 10,000+ businesses.
          </p>

          <div className="space-y-3">
            {['Bulk broadcasts to 25K+ contacts', 'AI-powered automation flows', 'Real-time analytics dashboard', 'Multi-agent team inbox'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-brand-purple/40 flex items-center justify-center shrink-0">
                  <span className="text-xs text-white">✓</span>
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4A6CF7)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 font-jakarta">Adswadi WhatsApp API</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                leftIcon={<Mail size={16} />}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-gray-700">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-brand-purple" />
                  Remember me
                </label>
                <a href="#" className="text-sm font-semibold text-brand-purple hover:underline">Forgot password?</a>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-brand-purple hover:underline">
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
