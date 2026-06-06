import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import useAuthStore from '@/store/authStore'
import useSocketStore from '@/store/socketStore'

import AppLayout from '@/components/layout/AppLayout'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import InboxPage from '@/pages/InboxPage'
import CampaignsPage from '@/pages/CampaignsPage'
import ContactsPage from '@/pages/ContactsPage'
import FlowsPage from '@/pages/FlowsPage'
import TemplatesPage from '@/pages/TemplatesPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import BillingPage from '@/pages/BillingPage'
import SettingsPage from '@/pages/SettingsPage'

const ProtectedRoute = ({ children }) => {
  const { accessToken, user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: 'linear-gradient(135deg, #7B2FBE, #4A6CF7)' }}>
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

const PublicRoute = ({ children }) => {
  const { accessToken, user } = useAuthStore()
  if (accessToken && user) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  const { fetchMe, accessToken } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    if (accessToken) {
      fetchMe()
    } else {
      useAuthStore.setState({ isInitialized: true })
    }
  }, [])

  useEffect(() => {
    if (accessToken) {
      connect(accessToken)
    } else {
      disconnect()
    }
    return () => {}
  }, [accessToken])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#7B2FBE', secondary: 'white' },
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/flows" element={<FlowsPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
