import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, User, Mail, Lock, Building } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    organizationName: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      organizationName: form.organizationName,
    })

    if (result.success) {
      toast.success('Account created! Let\'s get you set up.')
      navigate('/onboarding')
    } else {
      toast.error(result.message || 'Registration failed')
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <img src="/adswadi-logo.png" alt="Adswadi" className="w-9 h-9 object-contain" />
          <span className="font-bold text-gray-900 font-jakarta text-lg">Adswadi WhatsApp API</span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Start for free, no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Rahul Sharma"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              leftIcon={<User size={16} />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              leftIcon={<Mail size={16} />}
            />

            <Input
              label="Organization Name (optional)"
              placeholder="Your Agency Name"
              value={form.organizationName}
              onChange={update('organizationName')}
              leftIcon={<Building size={16} />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              leftIcon={<Lock size={16} />}
            />

            <p className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <a href="#" className="text-brand-purple font-semibold hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-brand-purple font-semibold hover:underline">Privacy Policy</a>.
            </p>

            <Button type="submit" variant="gradient" className="w-full" size="lg" loading={isLoading}>
              Create Free Account
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-purple hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
