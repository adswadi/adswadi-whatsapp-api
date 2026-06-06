import { Bell, Search, Menu, Wifi, WifiOff } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '@/store/authStore'
import useSocketStore from '@/store/socketStore'
import Avatar from '@/components/ui/Avatar'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TopNav = ({ onMenuToggle, title }) => {
  const { user } = useAuthStore()
  const { isConnected, notifications } = useSocketStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-10 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        onClick={onMenuToggle}
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="font-bold text-gray-900 font-jakarta text-lg">{title}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64">
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none flex-1"
        />
      </div>

      {/* Connection status */}
      <div className={cn(
        'hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg',
        isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      )}>
        {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
        <span>{isConnected ? 'Live' : 'Offline'}</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <button
        className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-colors"
        onClick={() => navigate('/settings')}
      >
        <Avatar src={user?.avatar} name={user?.name} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </button>
    </header>
  )
}

export default TopNav
