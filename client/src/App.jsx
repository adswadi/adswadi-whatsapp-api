import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import useAuthStore from '@/store/authStore'
import useSocketStore from '@/store/socketStore'

import AppLayout from '@/components/layout/AppLayout'
import SubscriptionExpiredModal from '@/components/SubscriptionExpiredModal'

import LandingPage from '@/pages/LandingPage'
import AboutPage from '@/pages/AboutPage'
import PrivacyPage from '@/pages/PrivacyPage'
import TermsPage from '@/pages/TermsPage'
import RefundPage from '@/pages/RefundPage'
import CareersPage from '@/pages/CareersPage'
import PartnerPage from '@/pages/PartnerPage'
import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
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
import AdminPage from '@/pages/AdminPage'
import FeatureDetailPage from '@/pages/marketing/FeatureDetailPage'
import IndustryDetailPage from '@/pages/marketing/IndustryDetailPage'
import IntegrationDetailPage from '@/pages/marketing/IntegrationDetailPage'
import PricingPage from '@/pages/marketing/PricingPage'
import HelpCenterPage from '@/pages/marketing/HelpCenterPage'
import BlogPage from '@/pages/marketing/BlogPage'
import ApiDocsPage from '@/pages/marketing/ApiDocsPage'
import CaseStudiesPage from '@/pages/marketing/CaseStudiesPage'
import TemplateLibraryPage from '@/pages/marketing/TemplateLibraryPage'

const ProtectedRoute = ({ children }) => {
  const { accessToken, user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/adswadi-logo.png" alt="Adswadi" className="w-12 h-12 object-contain animate-pulse" />
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
      connect()
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
      <SubscriptionExpiredModal />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/partner-program" element={<PartnerPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features/:slug" element={<FeatureDetailPage />} />
        <Route path="/industries/:slug" element={<IndustryDetailPage />} />
        <Route path="/integrations/:slug" element={<IntegrationDetailPage />} />
        <Route path="/help-center" element={<HelpCenterPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/developers" element={<ApiDocsPage />} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/template-library" element={<TemplateLibraryPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
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
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
