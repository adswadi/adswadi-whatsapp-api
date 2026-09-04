import { create } from 'zustand'
import api from '@/lib/api'

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
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Verification failed' }
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
