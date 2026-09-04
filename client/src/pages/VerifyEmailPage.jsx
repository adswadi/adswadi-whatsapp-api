import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const RESEND_COOLDOWN = 60

const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail, resendOtp, isLoading } = useAuthStore()
  const email = location.state?.email

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const focusInput = (i) => inputRefs.current[i]?.focus()

  const handleChange = (i, value) => {
    const v = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) focusInput(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) focusInput(i - 1)
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] || ''))
    focusInput(Math.min(pasted.length, 5))
  }

  const otp = digits.join('')

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter the 6-digit code')

    const result = await verifyEmail(email, otp)
    if (result.success) {
      toast.success('Email verified!')
      navigate('/onboarding')
    } else {
      toast.error(result.message || 'Verification failed')
    }
  }

  const handleResend = async () => {
    setResending(true)
    const result = await resendOtp(email)
    if (result.success) {
      toast.success('New code sent')
      setCooldown(RESEND_COOLDOWN)
      setDigits(['', '', '', '', '', ''])
      focusInput(0)
    } else {
      toast.error(result.message || 'Failed to resend code')
    }
    setResending(false)
  }

  if (!email) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <img src="/adswadi-logo.png" alt="Adswadi" className="w-9 h-9 object-contain" />
          <span className="font-bold text-gray-900 font-jakarta text-lg">Adswadi WhatsApp API</span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
          <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MailCheck size={26} className="text-brand-purple" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-jakarta mb-2">Verify your email</h1>
          <p className="text-gray-500 text-sm mb-1">
            Enter the 6-digit code sent to
          </p>
          <p className="text-gray-900 font-semibold text-sm mb-6">{email}</p>

          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
                />
              ))}
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg" loading={isLoading}>
              Verify & Continue
            </Button>
          </form>

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="mt-4 text-sm font-semibold text-brand-purple hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
          </button>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <Link to="/register" className="text-sm text-gray-400 hover:text-gray-600">
              ← Back to signup form
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
