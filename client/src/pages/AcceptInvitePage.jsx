import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, User, Lock, UserPlus } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const AcceptInvitePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { acceptInvite, isLoading } = useAuthStore()

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Full name is required'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'At least 8 characters'
    else if (!/[a-z]/.test(password)) errs.password = 'Add a lowercase letter'
    else if (!/[A-Z]/.test(password)) errs.password = 'Add an uppercase letter'
    else if (!/\d/.test(password)) errs.password = 'Add a number'
    else if (!/[^A-Za-z0-9]/.test(password)) errs.password = 'Add a special character'
    if (password !== confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await acceptInvite(token, name, password)
    if (result.success) {
      toast.success('Welcome to the team!')
      navigate('/dashboard')
    } else {
      toast.error(result.message || 'Failed to accept invite')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 justify-center mb-8">
            <img src="/adswadi-logo.png" alt="Adswadi" className="w-9 h-9 object-contain" />
            <span className="font-bold text-gray-900 font-jakarta text-lg">Adswadi WhatsApp API</span>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
            <h1 className="text-xl font-extrabold text-gray-900 font-jakarta mb-2">Invalid invite link</h1>
            <p className="text-gray-500 text-sm mb-6">This link is missing its invite code. Ask whoever invited you to send a new one.</p>
            <Link to="/login" className="text-sm font-semibold text-brand-purple hover:underline">Back to login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <img src="/adswadi-logo.png" alt="Adswadi" className="w-9 h-9 object-contain" />
          <span className="font-bold text-gray-900 font-jakarta text-lg">Adswadi WhatsApp API</span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus size={26} className="text-brand-purple" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-1">You're invited!</h1>
            <p className="text-gray-500 text-sm">Set your name and password to join the team</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User size={16} />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint={!errors.password ? '8+ characters, with upper, lower, number & special character' : undefined}
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
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
              leftIcon={<Lock size={16} />}
            />

            <Button type="submit" variant="gradient" className="w-full" size="lg" loading={isLoading}>
              Join Team
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

export default AcceptInvitePage
