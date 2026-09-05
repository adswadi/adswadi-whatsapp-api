import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, CheckCircle, ArrowRight, ArrowLeft, Phone, Key, Building, Users } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import api from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, title: 'About Your Business', icon: Building, description: 'Tell us about your organization' },
  { id: 2, title: 'Connect WhatsApp', icon: Phone, description: 'Link your WhatsApp Business API' },
  { id: 3, title: 'Invite Your Team', icon: Users, description: 'Add team members (optional)' },
  { id: 4, title: "You're All Set!", icon: CheckCircle, description: 'Start using Adswadi' },
]

const WELCOME_VIDEO_ID = '1MoDY0IIvAA'

const OnboardingPage = () => {
  const navigate = useNavigate()
  const { user, fetchMe } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Shown once per account, right when onboarding first loads — a
  // localStorage flag keyed by user id survives a refresh mid-onboarding
  // without needing a backend field just for this.
  useEffect(() => {
    if (!user?._id) return
    const key = `adswadi_welcome_video_seen_${user._id}`
    if (!localStorage.getItem(key)) setShowVideoModal(true)
  }, [user?._id])

  const dismissVideoModal = () => {
    if (user?._id) localStorage.setItem(`adswadi_welcome_video_seen_${user._id}`, '1')
    setShowVideoModal(false)
  }

  const [businessData, setBusinessData] = useState({
    organizationName: user?.organizationName || '',
    industry: '',
    teamSize: '1-5',
  })

  const [waData, setWaData] = useState({
    displayName: '',
    phoneNumber: '',
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
  })

  const [teamEmails, setTeamEmails] = useState([''])

  const handleNext = async () => {
    if (step === 1) {
      if (!businessData.organizationName) {
        toast.error('Please enter your organization name')
        return
      }
      try {
        await api.put('/auth/profile', { organizationName: businessData.organizationName })
        await fetchMe()
      } catch (_) {}
    }

    if (step === 2 && waData.displayName && waData.phoneNumberId) {
      setLoading(true)
      try {
        await api.post('/whatsapp/accounts', waData)
        toast.success('WhatsApp account connected!')
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to connect WhatsApp')
        setLoading(false)
        return
      }
      setLoading(false)
    }

    if (step === 3) {
      const validEmails = teamEmails.filter((e) => e.trim() && /\S+@\S+\.\S+/.test(e))
      if (validEmails.length > 0) {
        setLoading(true)
        for (const email of validEmails) {
          try {
            await api.post('/team/invite', { email })
          } catch (_) {}
        }
        setLoading(false)
      }
    }

    if (step === 4) {
      setLoading(true)
      try {
        await api.post('/auth/complete-onboarding')
        await fetchMe()
        navigate('/dashboard')
      } catch (_) {
        navigate('/dashboard')
      }
      setLoading(false)
      return
    }

    setStep((s) => Math.min(s + 1, 4))
  }

  const currentStep = STEPS[step - 1]
  const StepIcon = currentStep.icon

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #E8D5F5 0%, #D4E4FF 50%, #F5D0E8 100%)' }}>
      {/* Left panel - steps */}
      <div className="hidden lg:flex w-80 flex-col p-10 justify-between" style={{ background: '#1A0A2E' }}>
        <div>
          <div className="flex items-center gap-2 mb-12">
            <img src="/adswadi-logo.png" alt="Adswadi" className="w-8 h-8 object-contain" />
            <span className="text-white font-bold font-jakarta">Adswadi</span>
          </div>

          <div className="space-y-2">
            {STEPS.map(({ id, title, description, icon: Icon }) => (
              <div
                key={id}
                className={`flex gap-4 p-4 rounded-xl transition-all ${id === step ? 'bg-white/10' : id < step ? 'opacity-70' : 'opacity-40'}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${id < step ? 'bg-whatsapp' : id === step ? 'bg-brand-purple' : 'bg-white/10'}`}
                >
                  {id < step ? (
                    <CheckCircle size={18} className="text-white" />
                  ) : (
                    <Icon size={18} className="text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${id === step ? 'text-white' : 'text-white/60'}`}>{title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">Setting up takes less than 5 minutes</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Progress bar (mobile) */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Step {step} of {STEPS.length}</span>
              <span>{Math.round((step / STEPS.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(step / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #7B2FBE, #4A6CF7)' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7B2FBE20, #4A6CF720)' }}>
                <StepIcon size={20} className="text-brand-purple" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 font-jakarta">{currentStep.title}</h2>
                <p className="text-xs text-gray-500">{currentStep.description}</p>
              </div>
            </div>

            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-4">
                <Input
                  label="Organization / Agency Name"
                  placeholder="e.g. Digital Growth Agency"
                  value={businessData.organizationName}
                  onChange={(e) => setBusinessData({ ...businessData, organizationName: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                    value={businessData.industry}
                    onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
                  >
                    <option value="">Select your industry</option>
                    {['Digital Marketing Agency', 'E-commerce', 'Education', 'Real Estate', 'Healthcare', 'Retail', 'Finance', 'Other'].map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Team Size</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                    value={businessData.teamSize}
                    onChange={(e) => setBusinessData({ ...businessData, teamSize: e.target.value })}
                  >
                    {['Just me', '2-5', '6-20', '21-50', '50+'].map((s) => (
                      <option key={s} value={s}>{s} people</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: WhatsApp Setup */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 border border-blue-100">
                  <p className="font-semibold mb-1">Need your Meta Business API credentials?</p>
                  <p className="text-xs text-blue-600">Go to <a href="https://business.facebook.com" className="underline" target="_blank" rel="noreferrer">business.facebook.com</a> → WhatsApp Manager → API Setup</p>
                </div>
                <Input
                  label="Display Name"
                  placeholder="Your Business WhatsApp Name"
                  value={waData.displayName}
                  onChange={(e) => setWaData({ ...waData, displayName: e.target.value })}
                />
                <Input
                  label="Phone Number (with country code)"
                  placeholder="+91 98765 43210"
                  value={waData.phoneNumber}
                  onChange={(e) => setWaData({ ...waData, phoneNumber: e.target.value })}
                />
                <Input
                  label="Phone Number ID"
                  placeholder="From Meta Developer Portal"
                  value={waData.phoneNumberId}
                  onChange={(e) => setWaData({ ...waData, phoneNumberId: e.target.value })}
                />
                <Input
                  label="WhatsApp Business Account ID (WABA ID)"
                  placeholder="Your WABA ID"
                  value={waData.wabaId}
                  onChange={(e) => setWaData({ ...waData, wabaId: e.target.value })}
                />
                <Input
                  label="Permanent Access Token"
                  type="password"
                  placeholder="Your access token (encrypted & stored safely)"
                  value={waData.accessToken}
                  onChange={(e) => setWaData({ ...waData, accessToken: e.target.value })}
                  leftIcon={<Key size={16} />}
                />
                <p className="text-xs text-gray-400">You can skip this step and add your WhatsApp account later in Settings.</p>
              </div>
            )}

            {/* Step 3: Team */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Invite team members to collaborate on your WhatsApp inbox.</p>
                {teamEmails.map((email, i) => (
                  <Input
                    key={i}
                    placeholder={`teammate${i + 1}@company.com`}
                    value={email}
                    onChange={(e) => {
                      const updated = [...teamEmails]
                      updated[i] = e.target.value
                      setTeamEmails(updated)
                    }}
                  />
                ))}
                {teamEmails.length < 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTeamEmails([...teamEmails, ''])}
                  >
                    + Add another
                  </Button>
                )}
                <p className="text-xs text-gray-400">Team members will receive an email invite. You can also add them later in Team Settings.</p>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-whatsapp/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-whatsapp" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-jakarta mb-2">You're all set!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your Adswadi workspace is ready. Start by importing your contacts or sending your first broadcast.
                </p>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    { emoji: '📱', title: 'Connect WhatsApp', desc: 'Add your number in Settings' },
                    { emoji: '👥', title: 'Import Contacts', desc: 'Upload your CSV file' },
                    { emoji: '📢', title: 'Create Broadcast', desc: 'Send your first campaign' },
                    { emoji: '🤖', title: 'Build a Flow', desc: 'Automate conversations' },
                  ].map(({ emoji, title, desc }) => (
                    <div key={title} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-lg mb-1">{emoji}</p>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => s - 1)}
                  leftIcon={<ArrowLeft size={16} />}
                >
                  Back
                </Button>
              ) : <div />}

              <Button
                variant="gradient"
                onClick={handleNext}
                loading={loading}
                rightIcon={step < 4 ? <ArrowRight size={16} /> : null}
              >
                {step === 2 && !waData.displayName ? 'Skip for Now' : step === 3 ? 'Send Invites & Continue' : step === 4 ? 'Go to Dashboard' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showVideoModal} onClose={dismissVideoModal} title="Watch Video To Apply Adswadi WhatsApp API" size="lg">
        <div className="p-6">
          <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${WELCOME_VIDEO_ID}`}
              title="How to apply for Adswadi WhatsApp API"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default OnboardingPage
