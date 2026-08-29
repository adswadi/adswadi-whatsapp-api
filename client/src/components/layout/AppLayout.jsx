import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import TrialBanner from './TrialBanner'
import { cn } from '@/lib/utils'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
  '/campaigns': 'Campaigns',
  '/contacts': 'Contacts',
  '/flows': 'Automation Flows',
  '/templates': 'Message Templates',
  '/analytics': 'Analytics',
  '/billing': 'Billing & Plans',
  '/settings': 'Settings',
}

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const title = PAGE_TITLES[location.pathname] || 'Adswadi WhatsApp'

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col h-full border-r border-white/10">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-sidebar-bg h-full z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />
        <TrialBanner />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
