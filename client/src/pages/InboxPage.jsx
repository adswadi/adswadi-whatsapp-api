import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import useSocketStore from '@/store/socketStore'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import ContactPanel from '@/components/chat/ContactPanel'
import { MessageSquare } from 'lucide-react'

const InboxPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConvId, setSelectedConvId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [showContactPanel, setShowContactPanel] = useState(false)
  const { socket } = useSocketStore()

  const selectedConv = conversations.find((c) => c._id === selectedConvId)

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 50 })
      if (filter !== 'all') params.set('status', filter)
      const res = await api.get(`/conversations?${params}`)
      setConversations(res.data.data || [])
    } catch (err) {
      console.error('Fetch conversations error:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Real-time updates
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = ({ conversationId, message, contact }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === conversationId)
        if (idx === -1) {
          fetchConversations()
          return prev
        }
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          lastMessage: {
            text: message.content?.text || `[${message.type}]`,
            type: message.type,
            timestamp: new Date(),
            fromContact: message.direction === 'inbound',
          },
          unreadCount: conversationId !== selectedConvId
            ? (updated[idx].unreadCount || 0) + 1
            : 0,
        }
        // Move to top
        const conv = updated.splice(idx, 1)[0]
        return [conv, ...updated]
      })
    }

    const handleConvUpdated = ({ conversation }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, ...conversation } : c))
      )
    }

    socket.on('new_message', handleNewMessage)
    socket.on('conversation_updated', handleConvUpdated)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('conversation_updated', handleConvUpdated)
    }
  }, [socket, selectedConvId, fetchConversations])

  const handleSelectConversation = (conv) => {
    setSelectedConvId(conv._id)
    setShowContactPanel(false)
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
    )
  }

  const handleStatusChange = (convId, status) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, status } : c))
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-50">
      {/* Conversation list */}
      <div className={`${selectedConvId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col bg-white border-r border-gray-100 shrink-0`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConvId}
          onSelect={handleSelectConversation}
          filter={filter}
          onFilterChange={setFilter}
          loading={loading}
        />
      </div>

      {/* Chat window */}
      <div className={`${selectedConvId ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
        {selectedConv ? (
          <ChatWindow
            conversation={selectedConv}
            onBack={() => setSelectedConvId(null)}
            onStatusChange={handleStatusChange}
            onToggleContact={() => setShowContactPanel(!showContactPanel)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-brand-purple" />
            </div>
            <p className="font-bold text-gray-900 font-jakarta text-lg">Select a conversation</p>
            <p className="text-gray-500 text-sm mt-1">Choose a chat from the left to start messaging</p>
          </div>
        )}
      </div>

      {/* Contact panel */}
      {showContactPanel && selectedConv && (
        <div className="hidden lg:flex w-80 shrink-0 border-l border-gray-100 bg-white overflow-y-auto">
          <ContactPanel
            contactId={selectedConv.contactId?._id || selectedConv.contactId}
            onClose={() => setShowContactPanel(false)}
          />
        </div>
      )}
    </div>
  )
}

export default InboxPage
