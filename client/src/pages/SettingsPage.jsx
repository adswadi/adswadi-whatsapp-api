import { useEffect, useState, useCallback } from 'react'
import { Settings, User, Bell, Phone, Shield, Users, Plus, Trash2, Eye, EyeOff, Save, CheckCircle, Camera, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const VERTICAL_OPTIONS = [
  { value: 'UNDEFINED', label: 'Not specified' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'APPAREL', label: 'Clothing & Apparel' },
  { value: 'AUTO', label: 'Automotive' },
  { value: 'BEAUTY', label: 'Beauty, Spa & Salon' },
  { value: 'EDU', label: 'Education' },
  { value: 'ENTERTAIN', label: 'Entertainment' },
  { value: 'EVENT_PLAN', label: 'Event Planning' },
  { value: 'FINANCE', label: 'Finance & Banking' },
  { value: 'GROCERY', label: 'Grocery' },
  { value: 'GOVT', label: 'Government' },
  { value: 'HOTEL', label: 'Hotel & Lodging' },
  { value: 'HEALTH', label: 'Medical & Health' },
  { value: 'NONPROFIT', label: 'Non-profit' },
  { value: 'PROF_SERVICES', label: 'Professional Services' },
  { value: 'TRAVEL', label: 'Travel & Transportation' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'OTHER', label: 'Other' },
]

// Fetches/updates the WhatsApp Business Profile Meta shows customers (photo,
// about line, description, address, email, websites) — the same info
// otherwise only editable from WhatsApp Manager. Self-contained so its own
// loading/saving state doesn't churn the whole Settings page.
const BusinessProfileCard = ({ account }) => {
  const [profile, setProfile] = useState({ about: '', description: '', address: '', email: '', websites: ['', ''], vertical: 'UNDEFINED' })
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    if (!account) return
    setLoading(true)
    api.get(`/whatsapp/accounts/${account._id}/business-profile`)
      .then((res) => {
        const p = res.data.data.profile || {}
        setProfile({
          about: p.about || '',
          description: p.description || '',
          address: p.address || '',
          email: p.email || '',
          websites: [p.websites?.[0] || '', p.websites?.[1] || ''],
          vertical: p.vertical || 'UNDEFINED',
        })
        setPhotoUrl(p.profile_picture_url || null)
      })
      .catch(() => toast.error('Failed to load business profile'))
      .finally(() => setLoading(false))
  }, [account?._id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/whatsapp/accounts/${account._id}/business-profile`, {
        ...profile,
        websites: profile.websites.filter((w) => w.trim()),
      })
      toast.success('Business profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
    setSaving(false)
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('photo', file)
    setUploadingPhoto(true)
    try {
      await api.post(`/whatsapp/accounts/${account._id}/business-profile/photo`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPhotoUrl(URL.createObjectURL(file))
      toast.success('Profile photo updated — may take a few minutes to appear on WhatsApp')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo')
    }
    setUploadingPhoto(false)
    e.target.value = ''
  }

  if (!account) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <p className="text-xs text-gray-400 mt-0.5">What customers see when they open a chat with {account.displayName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-40 bg-gray-100 rounded-xl skeleton" />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-green-50 overflow-hidden flex items-center justify-center shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Phone size={22} className="text-green-500" />
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={18} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple cursor-pointer hover:underline">
                  <Camera size={14} /> Change photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploadingPhoto} />
                </label>
                <p className="text-xs text-gray-400 mt-0.5">JPG or PNG, square works best</p>
              </div>
            </div>

            <Input
              label="About"
              placeholder="Short status line, e.g. Available 9am-9pm"
              maxLength={139}
              value={profile.about}
              onChange={(e) => setProfile({ ...profile, about: e.target.value })}
            />
            <Textarea
              label="Description"
              placeholder="Tell customers what your business does"
              maxLength={512}
              rows={3}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="support@yourbusiness.com"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Select
                label="Industry"
                options={VERTICAL_OPTIONS}
                value={profile.vertical}
                onChange={(e) => setProfile({ ...profile, vertical: e.target.value })}
              />
            </div>
            <Input
              label="Address"
              placeholder="Business address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Website 1"
                placeholder="https://yourbusiness.com"
                value={profile.websites[0]}
                onChange={(e) => setProfile({ ...profile, websites: [e.target.value, profile.websites[1]] })}
              />
              <Input
                label="Website 2"
                placeholder="https://yourbusiness.com/shop"
                value={profile.websites[1]}
                onChange={(e) => setProfile({ ...profile, websites: [profile.websites[0], e.target.value] })}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="gradient" leftIcon={<Save size={14} />} loading={saving} onClick={handleSave}>
                Save Business Profile
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
]

const SettingsPage = () => {
  const { user, fetchMe } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({ name: '', organizationName: '', timezone: 'Asia/Kolkata' })
  const [notifications, setNotifications] = useState({ email: true, browser: true, newMessage: true, broadcastComplete: true })
  const [waAccounts, setWaAccounts] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [seatLimit, setSeatLimit] = useState(null) // -1 = unlimited, null = unknown yet
  const [teamPlanName, setTeamPlanName] = useState(null)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [newWa, setNewWa] = useState({ displayName: '', phoneNumber: '', phoneNumberId: '', wabaId: '', accessToken: '' })
  const [showAddWa, setShowAddWa] = useState(false)
  const [embeddedSignupLoading, setEmbeddedSignupLoading] = useState(false)
  const [embeddedData, setEmbeddedData] = useState(null) // { accessToken, businesses }
  const [selectedPhone, setSelectedPhone] = useState(null)

  // Resilience for when the Facebook popup opened as a full tab: Chrome can
  // throttle or discard a backgrounded tab's timers, so the poll inside
  // launchEmbeddedSignup may never fire. Checking on mount and on focus
  // catches the code even if that original poll died.
  const checkStoredOauthCode = useCallback(async () => {
    const stored = localStorage.getItem('fb_oauth_code')
    if (!stored) return
    localStorage.removeItem('fb_oauth_code')
    let code
    try {
      ({ code } = JSON.parse(stored))
    } catch (_) { return }
    if (!code) return

    setEmbeddedSignupLoading(true)
    try {
      const res = await api.post('/whatsapp/embedded-signup', { code })
      const { accessToken, wabas } = res.data.data
      if (wabas && wabas.length > 0) {
        setEmbeddedData({ accessToken, wabas, manualEntry: false })
        toast.success('Facebook connected! Select your WhatsApp number below.')
      } else {
        setEmbeddedData({ accessToken, wabas: [], manualEntry: true })
        toast.success('Facebook connected! Enter your WhatsApp Business details below.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    }
    setEmbeddedSignupLoading(false)
  }, [])

  useEffect(() => {
    checkStoredOauthCode()
    const onFocus = () => checkStoredOauthCode()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [checkStoredOauthCode])

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', organizationName: user.organizationName || '', timezone: user.settings?.timezone || 'Asia/Kolkata' })
      setNotifications(user.settings?.notifications || notifications)
    }
    fetchWaAccounts()
    fetchTeam()
  }, [user])

  const fetchWaAccounts = async () => {
    try {
      const res = await api.get('/whatsapp/accounts')
      setWaAccounts(res.data.data.accounts || [])
    } catch (_) {}
  }

  const fetchTeam = async () => {
    try {
      const res = await api.get('/team')
      setTeamMembers(res.data.data.members || [])
      setSeatLimit(res.data.data.seatLimit ?? null)
      setTeamPlanName(res.data.data.planName || null)
    } catch (_) {}
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      await api.put('/auth/profile', profile)
      await fetchMe()
      toast.success('Profile updated!')
    } catch (_) { toast.error('Update failed') }
    setLoading(false)
  }

  const saveNotifications = async () => {
    setLoading(true)
    try {
      await api.put('/settings/notifications', { notifications })
      toast.success('Notification preferences saved!')
    } catch (_) { toast.error('Update failed') }
    setLoading(false)
  }

  const changePassword = async () => {
    if (!passwords.current || !passwords.new) return toast.error('Fill all password fields')
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.new })
      toast.success('Password changed!')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password') }
    setLoading(false)
  }

  const addWaAccount = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/whatsapp/accounts', newWa)
      toast.success('WhatsApp account connected!')
      setNewWa({ displayName: '', phoneNumber: '', phoneNumberId: '', wabaId: '', accessToken: '' })
      setShowAddWa(false)
      fetchWaAccounts()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to connect') }
    setLoading(false)
  }

  const launchEmbeddedSignup = useCallback(() => {
    const appId = import.meta.env.VITE_META_APP_ID || '1271603524954079'
    const configId = import.meta.env.VITE_META_CONFIG_ID || '1744062660144243'
    const redirectUri = encodeURIComponent(`${window.location.origin}/`)
    const extras = encodeURIComponent(JSON.stringify({ setup: {}, featureType: '', sessionInfoVersion: '3' }))
    const fbUrl = `https://www.facebook.com/dialog/oauth?client_id=${appId}&display=popup&response_type=code&redirect_uri=${redirectUri}&config_id=${configId}&override_default_response_type=true&extras=${extras}`

    localStorage.removeItem('fb_oauth_code')

    const popup = window.open(fbUrl, 'fb-signup', 'width=720,height=800,scrollbars=yes,resizable=yes')
    if (!popup) {
      toast.error('Popup blocked! Allow popups for this site and try again.')
      return
    }
    setEmbeddedSignupLoading(true)

    let waSessionData = null
    let done = false

    const cleanup = () => {
      window.removeEventListener('message', handleMessage)
      clearInterval(pollInterval)
    }

    const finish = async (code) => {
      if (done) return
      done = true
      cleanup()
      try {
        const res = await api.post('/whatsapp/embedded-signup', { code })
        const { accessToken, wabas } = res.data.data

        if (waSessionData?.phone_number_id && waSessionData?.waba_id) {
          await api.post('/whatsapp/embedded-signup/connect', {
            accessToken,
            phoneNumberId: waSessionData.phone_number_id,
            wabaId: waSessionData.waba_id,
            displayName: 'WhatsApp Business',
            phoneNumber: '',
          })
          toast.success('🎉 WhatsApp number connected successfully!')
          setEmbeddedData(null)
          fetchWaAccounts()
        } else if (wabas && wabas.length > 0) {
          setEmbeddedData({ accessToken, wabas, manualEntry: false })
          toast.success('Facebook connected! Select your WhatsApp number below.')
        } else {
          setEmbeddedData({ accessToken, wabas: [], manualEntry: true })
          toast.success('Facebook connected! Enter your WhatsApp Business details below.')
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Signup failed')
      }
      setEmbeddedSignupLoading(false)
    }

    const handleMessage = (event) => {
      if (event.origin === 'https://www.facebook.com' && event.data?.type === 'WA_EMBEDDED_SIGNUP') {
        if (event.data.event === 'FINISH') {
          waSessionData = event.data.data
        } else if (event.data.event === 'CANCEL') {
          done = true
          cleanup()
          setEmbeddedSignupLoading(false)
          toast('Signup cancelled')
        } else if (event.data.event === 'ERROR') {
          done = true
          cleanup()
          setEmbeddedSignupLoading(false)
          toast.error('WhatsApp signup error: ' + (event.data.data?.error_message || 'Unknown error'))
        }
        return
      }
      if (event.origin === window.location.origin && event.data?.type === 'FB_OAUTH_CODE') {
        finish(event.data.code)
      }
    }
    window.addEventListener('message', handleMessage)

    const pollInterval = setInterval(() => {
      const stored = localStorage.getItem('fb_oauth_code')
      if (stored) {
        localStorage.removeItem('fb_oauth_code')
        try {
          const { code } = JSON.parse(stored)
          if (code) finish(code)
        } catch (_) {}
      }
      if (popup.closed && !done) {
        cleanup()
        setEmbeddedSignupLoading(false)
      }
    }, 1000)
  }, [fetchWaAccounts])

  const connectEmbeddedPhone = async (phone, waba, accessToken) => {
    setLoading(true)
    try {
      await api.post('/whatsapp/embedded-signup/connect', {
        accessToken,
        phoneNumberId: phone.id,
        wabaId: waba.id,
        displayName: phone.verified_name || waba.name,
        phoneNumber: phone.display_phone_number,
      })
      toast.success('WhatsApp number connected!')
      setEmbeddedData(null)
      setSelectedPhone(null)
      fetchWaAccounts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to connect')
    }
    setLoading(false)
  }

  const removeWaAccount = async (id) => {
    if (!confirm('Remove this WhatsApp account?')) return
    try {
      await api.delete(`/whatsapp/accounts/${id}`)
      toast.success('Account removed')
      fetchWaAccounts()
    } catch (_) { toast.error('Failed to remove') }
  }

  const inviteTeamMember = async () => {
    if (!inviteEmail) return toast.error('Email required')
    setLoading(true)
    try {
      await api.post('/team/invite', { email: inviteEmail })
      toast.success(`Invite sent to ${inviteEmail}!`)
      setInviteEmail('')
      fetchTeam()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to invite') }
    setLoading(false)
  }

  const removeMember = async (id) => {
    if (!confirm('Remove this team member?')) return
    try {
      await api.delete(`/team/${id}`)
      toast.success('Member removed')
      fetchTeam()
    } catch (_) { toast.error('Failed to remove') }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900 font-jakarta">Settings</h2>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-52 shrink-0">
          <nav className="space-y-1 bg-white rounded-2xl p-2 border border-gray-100 shadow-sm">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  activeTab === id ? 'bg-brand-purple text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 space-y-4">
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <Avatar name={user?.name} src={user?.avatar} size="xl" />
                  <div>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <Badge variant="purple" className="mt-1 capitalize">{user?.plan} plan</Badge>
                  </div>
                </div>
                <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                <Input label="Organization Name" value={profile.organizationName} onChange={(e) => setProfile({ ...profile, organizationName: e.target.value })} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  >
                    {['Asia/Kolkata', 'Asia/Dubai', 'UTC', 'America/New_York', 'Europe/London'].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <Button variant="gradient" loading={loading} onClick={saveProfile} leftIcon={<Save size={14} />}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'browser', label: 'Browser Notifications', desc: 'Get desktop push notifications' },
                  { key: 'newMessage', label: 'New Message Alerts', desc: 'Alert when a new WhatsApp message arrives' },
                  { key: 'broadcastComplete', label: 'Broadcast Complete', desc: 'Notify when a campaign finishes' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={cn('w-11 h-6 rounded-full transition-colors relative', notifications[key] ? 'bg-brand-purple' : 'bg-gray-200')}
                    >
                      <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', notifications[key] ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>
                ))}
                <Button variant="gradient" loading={loading} onClick={saveNotifications} leftIcon={<Save size={14} />}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {/* WhatsApp tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Connected Accounts</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="gradient" size="sm" leftIcon={<Plus size={14} />} onClick={launchEmbeddedSignup} loading={embeddedSignupLoading}>
                      Connect via Facebook
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowAddWa(!showAddWa)}>
                      Manual
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {waAccounts.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Phone size={28} className="text-green-500" />
                      </div>
                      <p className="font-semibold text-gray-700 mb-1">No WhatsApp accounts connected</p>
                      <p className="text-sm text-gray-400 mb-4">Connect your WhatsApp Business number to start sending messages</p>
                      <Button variant="gradient" leftIcon={<Plus size={14} />} onClick={launchEmbeddedSignup} loading={embeddedSignupLoading}>
                        Connect WhatsApp via Facebook
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {waAccounts.map((acc) => (
                        <div key={acc._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                              <Phone size={18} className="text-green-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{acc.displayName}</p>
                              <p className="text-xs text-gray-500">{acc.phoneNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={acc.isActive ? 'green' : 'default'} dot>{acc.isActive ? 'Active' : 'Inactive'}</Badge>
                            <button onClick={() => removeWaAccount(acc._id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <BusinessProfileCard account={waAccounts.find((a) => a.isActive) || waAccounts[0]} />

              {/* Embedded Signup Result — WABA phone list */}
              {embeddedData && !embeddedData.manualEntry && embeddedData.wabas?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Select Your WhatsApp Number</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500">Facebook connected! Select the WhatsApp Business number you want to connect:</p>
                    {embeddedData.wabas.map((waba) => (
                      <div key={waba.id} className="border border-gray-100 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">WABA: {waba.name} ({waba.id})</p>
                        {(waba.phone_numbers?.data || []).map((phone) => (
                          <div key={phone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2 last:mb-0">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{phone.verified_name || phone.display_phone_number}</p>
                              <p className="text-xs text-gray-500">{phone.display_phone_number}</p>
                              <span className={`text-xs font-medium ${phone.code_verification_status === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {phone.code_verification_status === 'VERIFIED' ? '✓ Verified' : 'Not Verified'}
                              </span>
                            </div>
                            <Button variant="gradient" size="sm" loading={loading} onClick={() => connectEmbeddedPhone(phone, waba, embeddedData.accessToken)}>
                              Connect
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => setEmbeddedData({ ...embeddedData, manualEntry: true })}>
                      Enter details manually instead
                    </Button>
                    <button onClick={() => setEmbeddedData(null)} className="text-xs text-gray-400 hover:text-gray-600 ml-3">Cancel</button>
                  </CardContent>
                </Card>
              )}

              {/* Embedded Signup Result — manual entry */}
              {embeddedData?.manualEntry && (
                <Card>
                  <CardHeader><CardTitle>Enter WhatsApp Business Details</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500">Facebook connected successfully. Enter your WhatsApp Business Account details from <a href="https://business.facebook.com/wa/manage/phone-numbers/" target="_blank" rel="noreferrer" className="text-purple-600 underline">Meta Business Manager</a>.</p>
                    <Input label="Display Name" placeholder="Business Name" value={newWa.displayName} onChange={(e) => setNewWa({ ...newWa, displayName: e.target.value })} />
                    <Input label="Phone Number" placeholder="+91 98765 43210" value={newWa.phoneNumber} onChange={(e) => setNewWa({ ...newWa, phoneNumber: e.target.value })} />
                    <Input label="Phone Number ID" placeholder="From Meta → WhatsApp → Phone Numbers" value={embeddedData.phoneNumberId || newWa.phoneNumberId} onChange={(e) => setNewWa({ ...newWa, phoneNumberId: e.target.value })} />
                    <Input label="WABA ID" placeholder="WhatsApp Business Account ID" value={embeddedData.wabaId || newWa.wabaId} onChange={(e) => setNewWa({ ...newWa, wabaId: e.target.value })} />
                    <div className="flex gap-3">
                      <Button variant="secondary" type="button" onClick={() => setEmbeddedData(null)}>Cancel</Button>
                      <Button variant="gradient" loading={loading} onClick={async () => {
                        setLoading(true)
                        try {
                          await api.post('/whatsapp/accounts', {
                            ...newWa,
                            phoneNumberId: embeddedData.phoneNumberId || newWa.phoneNumberId,
                            wabaId: embeddedData.wabaId || newWa.wabaId,
                            accessToken: embeddedData.accessToken,
                          })
                          toast.success('WhatsApp account connected!')
                          setEmbeddedData(null)
                          setNewWa({ displayName: '', phoneNumber: '', phoneNumberId: '', wabaId: '', accessToken: '' })
                          fetchWaAccounts()
                        } catch (err) { toast.error(err.response?.data?.message || 'Failed to connect') }
                        setLoading(false)
                      }}>Connect Account</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showAddWa && (
                <Card>
                  <CardHeader><CardTitle>Manual Connect</CardTitle></CardHeader>
                  <form onSubmit={addWaAccount}>
                    <CardContent className="space-y-3">
                      <Input label="Display Name" placeholder="Business Name" value={newWa.displayName} onChange={(e) => setNewWa({ ...newWa, displayName: e.target.value })} />
                      <Input label="Phone Number" placeholder="+91 98765 43210" value={newWa.phoneNumber} onChange={(e) => setNewWa({ ...newWa, phoneNumber: e.target.value })} />
                      <Input label="Phone Number ID" placeholder="Meta Phone Number ID" value={newWa.phoneNumberId} onChange={(e) => setNewWa({ ...newWa, phoneNumberId: e.target.value })} />
                      <Input label="WABA ID" placeholder="WhatsApp Business Account ID" value={newWa.wabaId} onChange={(e) => setNewWa({ ...newWa, wabaId: e.target.value })} />
                      <Input label="Access Token" type="password" placeholder="Permanent access token" value={newWa.accessToken} onChange={(e) => setNewWa({ ...newWa, accessToken: e.target.value })} />
                      <div className="flex gap-3">
                        <Button variant="secondary" type="button" onClick={() => setShowAddWa(false)}>Cancel</Button>
                        <Button variant="gradient" type="submit" loading={loading}>Connect Account</Button>
                      </div>
                    </CardContent>
                  </form>
                </Card>
              )}
            </div>
          )}

          {/* Team tab */}
          {activeTab === 'team' && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                {seatLimit !== null && (
                  <Badge variant={seatLimit !== -1 && teamMembers.length >= seatLimit ? 'red' : 'default'} className="text-xs capitalize">
                    {seatLimit === -1 ? 'Unlimited seats' : `${teamMembers.length} / ${seatLimit} seats · ${teamPlanName} plan`}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {seatLimit !== null && seatLimit !== -1 && teamMembers.length >= seatLimit ? (
                  <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-sm text-amber-800">
                      You've used all {seatLimit} seats on your {teamPlanName} plan. Upgrade to invite more teammates.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => window.location.assign('/billing')}>Upgrade</Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Input
                      placeholder="team@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="gradient" loading={loading} onClick={inviteTeamMember} leftIcon={<Plus size={14} />}>
                      Invite
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {teamMembers.map((m) => (
                    <div key={m._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} src={m.avatar} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.role === 'owner' ? 'purple' : m.role === 'admin' ? 'blue' : 'default'} className="capitalize text-[10px]">{m.role}</Badge>
                        {m._id !== user?._id && (
                          <button onClick={() => removeMember(m._id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Current Password"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
                <Input
                  label="New Password"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                <Input
                  label="Confirm New Password"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} className="rounded" />
                    Show passwords
                  </label>
                  <Button variant="gradient" loading={loading} onClick={changePassword} leftIcon={<Shield size={14} />}>
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
