import { create } from 'zustand'
import api from '@/lib/api'
import useSubscriptionStore from './subscriptionStore'

// Runs right after login/session-restore so an expired trial blocks the
// dashboard immediately — previously the renew popup only ever appeared
// reactively, the first time the customer happened to try sending a
// message, so simply opening the app after expiry showed nothing at all.
const checkSubscriptionStatus = async () => {
  try {
    const res = await api.get('/billing/status')
    const { active, message } = res.data.data
    if (!active) useSubscriptionStore.getState().showExpiredModal(message)
  } catch (_) {}
}

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({ user, accessToken, refreshToken, isLoading: false })
      checkSubscriptionStatus()
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    }
  },

  // Registering no longer logs the user in directly — the account exists
  // but is unverified until verifyEmail() below succeeds with the OTP that
  // was just emailed to them.
  register: async (data) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/register', data)
      set({ isLoading: false })
      return { success: true, email: response.data.data.email }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Registration failed' }
    }
  },

  verifyEmail: async (email, otp) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/verify-email', { email, otp })
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({ user, accessToken, refreshToken, isLoading: false, isInitialized: true })
      checkSubscriptionStatus()
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Verification failed' }
    }
  },

  acceptInvite: async (token, name, password) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/accept-invite', { token, name, password })
      const { user, accessToken, refreshToken } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({ user, accessToken, refreshToken, isLoading: false, isInitialized: true })
      checkSubscriptionStatus()
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Failed to accept invite' }
    }
  },

  resendOtp: async (email) => {
    try {
      await api.post('/auth/resend-otp', { email })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend code' }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) {}
    localStorage.clear()
    set({ user: null, accessToken: null, refreshToken: null })
    window.location.href = '/login'
  },

  fetchMe: async () => {
    try {
      const response = await api.get('/auth/me')
      set({ user: response.data.data.user, isInitialized: true })
      checkSubscriptionStatus()
    } catch (_) {
      localStorage.clear()
      set({ user: null, accessToken: null, refreshToken: null, isInitialized: true })
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/profile', data)
      set({ user: response.data.data.user })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message }
    }
  },

  isAuthenticated: () => !!get().user && !!get().accessToken,
}))

export default useAuthStore
