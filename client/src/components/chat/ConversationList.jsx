import { Search, MessageSquare, Filter } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDateTime, cn, truncate } from '@/lib/utils'

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
]

const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  loading,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 font-jakarta">Inbox</h3>
          <span className="text-xs text-gray-400">{conversations.length} chats</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:bg-white"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={cn(
                'flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all',
                filter === value ? 'bg-white text-brand-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-gray-200 skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded skeleton w-3/4" />
                <div className="h-3 bg-gray-100 rounded skeleton w-full" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48">
            <MessageSquare size={28} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No conversations</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const contact = conv.contactId
            const isSelected = conv._id === selectedId
            const hasUnread = conv.unreadCount > 0

            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'flex gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-50 relative',
                  isSelected && 'bg-brand-purple/5 border-l-2 border-l-brand-purple'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar
                    name={contact?.name || conv.phoneNumber}
                    size="md"
                    status={hasUnread ? 'online' : 'offline'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn('text-sm truncate', hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800')}>
                      {contact?.name || conv.phoneNumber}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {formatDateTime(conv.lastMessage?.timestamp || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={cn('text-xs truncate flex-1', hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500')}>
                      {conv.lastMessage?.fromContact ? '' : ''}
                      {truncate(conv.lastMessage?.text || 'No messages yet', 40)}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 shrink-0 w-5 h-5 bg-brand-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {(conv.labels?.length > 0 || conv.assignedTo) && (
                    <div className="flex items-center gap-1 mt-1">
                      {conv.labels?.slice(0, 1).map((label) => (
                        <Badge key={label} variant="purple" className="text-[9px] px-1.5 py-0">{label}</Badge>
                      ))}
                      {conv.assignedTo && (
                        <span className="text-[9px] text-gray-400">→ {conv.assignedTo.name}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ConversationList
