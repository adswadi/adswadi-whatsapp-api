import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import {
  LayoutDashboard, MessageSquare, Megaphone, Users, GitBranch,
  FileText, BarChart2, CreditCard, Settings, LogOut, Zap,
  ChevronRight, Shield
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox', badge: null },
  { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: GitBranch, label: 'Flows', path: '/flows' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
]

const baseBottomItems = [
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

const PLAN_COLORS = {
  free: 'from-gray-500 to-gray-600',
  starter: 'from-blue-500 to-blue-600',
  growth: 'from-brand-purple to-brand-blue',
  enterprise: 'from-brand-pink to-brand-purple',
}

const Sidebar = ({ collapsed = false }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const bottomItems = user?.isPlatformAdmin
    ? [{ icon: Shield, label: 'Admin', path: '/admin' }, ...baseBottomItems]
    : baseBottomItems

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#1A0A2E' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/adswadi-logo.png" alt="Adswadi" className="w-9 h-9 object-contain shrink-0" />
          {!collapsed && (
            <div>
              <p className="font-bold text-white text-sm font-jakarta leading-tight">Adswadi</p>
              <p className="text-[10px] text-sidebar-text/60 leading-tight">WhatsApp API</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <p className="text-[10px] font-semibold text-sidebar-text/40 uppercase tracking-widest px-3 mb-2">
          {!collapsed && 'Menu'}
        </p>
        {navItems.map(({ icon: Icon, label, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                  : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-white/8'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={cn('shrink-0', isActive ? 'text-white' : 'text-sidebar-text/50 group-hover:text-sidebar-text')} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="bg-brand-pink text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
        {bottomItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-brand-purple text-white'
                  : 'text-sidebar-text/60 hover:text-sidebar-text hover:bg-white/8'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={cn('shrink-0', isActive ? 'text-white' : 'text-sidebar-text/50 group-hover:text-sidebar-text')} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Plan badge */}
        {!collapsed && user && (
          <div className={cn('mx-1 mt-2 p-3 rounded-xl bg-gradient-to-r text-white', PLAN_COLORS[user.plan] || PLAN_COLORS.free)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold opacity-80">Current Plan</p>
                <p className="text-sm font-bold capitalize">{user.plan}</p>
              </div>
              {user.plan !== 'enterprise' && (
                <NavLink to="/billing">
                  <div className="bg-white/20 rounded-lg p-1.5 hover:bg-white/30 transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* User profile */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl hover:bg-white/8 transition-colors group cursor-pointer">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #7B2FBE, #E91E8C)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-text text-sm font-medium truncate">{user?.name}</p>
              <p className="text-sidebar-text/40 text-xs truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
              title="Logout"
            >
              <LogOut size={14} className="text-sidebar-text/60" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
