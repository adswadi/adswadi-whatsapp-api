import { useEffect, useRef, useState, useCallback } from 'react'
import {
  ArrowLeft, Phone, MoreVertical, Send, Paperclip, Smile,
  CheckCircle2, XCircle, User, Mic, Image, FileText
} from 'lucide-react'
import api from '@/lib/api'
import useSocketStore from '@/store/socketStore'
import MessageBubble from './MessageBubble'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const ChatWindow = ({ conversation, onBack, onStatusChange, onToggleContact }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const { socket } = useSocketStore()

  const contact = conversation.contactId
  const waAccount = conversation.waAccountId

  const fetchMessages = useCallback(async (p = 1) => {
    setLoading(p === 1)
    try {
      const res = await api.get(`/conversations/${conversation._id}/messages?page=${p}&limit=50`)
      const newMessages = res.data.data || []
      if (p === 1) {
        setMessages(newMessages)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        setMessages((prev) => [...newMessages, ...prev])
      }
      setHasMore(p < (res.data.pagination?.pages || 1))
    } catch (err) {
      console.error('Fetch messages error:', err)
    } finally {
      setLoading(false)
    }
  }, [conversation._id])

  useEffect(() => {
    setMessages([])
    setPage(1)
    fetchMessages(1)
    inputRef.current?.focus()
  }, [conversation._id])

  // Real-time messages
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = ({ conversationId, message }) => {
      if (conversationId !== conversation._id) return
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id)
        if (exists) return prev
        return [...prev, message]
      })
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => m.waMessageId === messageId ? { ...m, status } : m)
      )
    }

    socket.emit('join_conversation', conversation._id)
    socket.on('new_message', handleNewMessage)
    socket.on('message_status', handleStatusUpdate)

    return () => {
      socket.emit('leave_conversation', conversation._id)
      socket.off('new_message', handleNewMessage)
      socket.off('message_status', handleStatusUpdate)
    }
  }, [socket, conversation._id])

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    const messageText = text.trim()
    setText('')
    setSending(true)

    // Optimistic update
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      direction: 'outbound',
      type: 'text',
      content: { text: messageText },
      status: 'pending',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempMsg])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const res = await api.post(`/conversations/${conversation._id}/messages`, {
        type: 'text',
        text: messageText,
      })
      const realMessage = res.data.data.message
      // The server also echoes this same message back over the socket, which
      // can arrive before this response does — drop the temp bubble and only
      // add the real one if the socket handler hasn't already added it.
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m._id !== tempMsg._id)
        if (withoutTemp.some((m) => m._id === realMessage._id)) return withoutTemp
        return [...withoutTemp, realMessage]
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message')
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id))
      setText(messageText)
    } finally {
      setSending(false)
    }
  }

  const sendMediaFile = async (file) => {
    if (!file || sending) return
    setSending(true)

    const tempMsg = {
      _id: `temp_${Date.now()}`,
      direction: 'outbound',
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'document',
      content: { mediaUrl: URL.createObjectURL(file), caption: '' },
      status: 'pending',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempMsg])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await api.post(`/conversations/${conversation._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const { url, type } = uploadRes.data.data

      const res = await api.post(`/conversations/${conversation._id}/messages`, { type, mediaUrl: url })
      const realMessage = res.data.data.message
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m._id !== tempMsg._id)
        if (withoutTemp.some((m) => m._id === realMessage._id)) return withoutTemp
        return [...withoutTemp, realMessage]
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send file')
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id))
    } finally {
      setSending(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) sendMediaFile(file)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/conversations/${conversation._id}`, { status })
      onStatusChange?.(conversation._id, status)
      toast.success(`Conversation ${status}`)
    } catch (_) { toast.error('Failed to update status') }
  }

  const statusColors = {
    open: 'green',
    pending: 'yellow',
    resolved: 'default',
    bot: 'purple',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>

        <Avatar name={contact?.name || conversation.phoneNumber} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 text-sm truncate">{contact?.name || conversation.phoneNumber}</p>
            <Badge variant={statusColors[conversation.status] || 'default'} dot className="text-[10px] capitalize">
              {conversation.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">{conversation.phoneNumber} • {waAccount?.displayName || 'WhatsApp'}</p>
        </div>

        <div className="flex items-center gap-1">
          {conversation.status !== 'resolved' && (
            <button
              onClick={() => handleStatusChange('resolved')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          )}
          {conversation.status === 'resolved' && (
            <button
              onClick={() => handleStatusChange('open')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Reopen
            </button>
          )}
          <button
            onClick={onToggleContact}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          >
            <User size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-gray-50 to-white">
        {hasMore && (
          <div className="text-center mb-4">
            <button
              className="text-xs text-brand-purple font-semibold hover:underline"
              onClick={() => { const newPage = page + 1; setPage(newPage); fetchMessages(newPage) }}
            >
              Load older messages
            </button>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                <div className={cn('h-10 bg-gray-200 rounded-2xl skeleton', i % 2 === 0 ? 'w-48' : 'w-36')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-12 h-12 bg-whatsapp/10 rounded-2xl flex items-center justify-center mb-3">
              <Phone size={22} className="text-whatsapp" />
            </div>
            <p className="font-semibold text-gray-700 text-sm">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const showDateSeparator =
              i === 0 ||
              new Date(msg.createdAt).toDateString() !== new Date(messages[i - 1]?.createdAt).toDateString()

            return (
              <div key={msg._id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} />
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        {conversation.windowExpiresAt && new Date(conversation.windowExpiresAt) < new Date() && (
          <div className="mb-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg text-center">
            24-hour messaging window expired. You can only send template messages.
          </div>
        )}
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <Paperclip size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Smile size={18} />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple transition-all bg-gray-50 focus:bg-white max-h-32"
              style={{ minHeight: '44px' }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0',
              text.trim()
                ? 'text-white shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            )}
            style={text.trim() ? { background: 'linear-gradient(135deg, #7B2FBE, #4A6CF7)' } : {}}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
