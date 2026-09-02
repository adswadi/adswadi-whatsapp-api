import { Check, CheckCheck, Clock, AlertCircle, Image, FileText, Mic, Video } from 'lucide-react'
import { formatTime, cn } from '@/lib/utils'

const StatusIcon = ({ status }) => {
  if (status === 'pending') return <Clock size={10} className="text-gray-400" />
  if (status === 'sent') return <Check size={10} className="text-gray-400" />
  if (status === 'delivered') return <CheckCheck size={10} className="text-gray-400" />
  if (status === 'read') return <CheckCheck size={10} className="text-blue-500" />
  if (status === 'failed') return <AlertCircle size={10} className="text-red-500" />
  return null
}

const MediaContent = ({ type, content }) => {
  if (type === 'image') {
    return (
      <div className="rounded-lg overflow-hidden mb-1">
        {content.mediaUrl ? (
          <img src={content.mediaUrl} alt={content.caption || 'Image'} className="max-w-full rounded-lg" />
        ) : (
          <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <Image size={24} className="text-gray-400" />
          </div>
        )}
        {content.caption && <p className="text-sm mt-1">{content.caption}</p>}
      </div>
    )
  }

  if (type === 'audio') {
    return content.mediaUrl ? (
      <audio src={content.mediaUrl} controls className="mb-1 max-w-[240px]" />
    ) : (
      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 mb-1">
        <Mic size={16} />
        <div className="flex-1 h-1 bg-white/50 rounded-full" />
        <span className="text-xs">Audio</span>
      </div>
    )
  }

  if (type === 'document') {
    return (
      <a
        href={content.mediaUrl || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 mb-1',
          content.mediaUrl && 'hover:bg-white/30 cursor-pointer'
        )}
      >
        <FileText size={16} />
        <span className="text-sm">{content.fileName || 'Document'}</span>
      </a>
    )
  }

  if (type === 'video') {
    return content.mediaUrl ? (
      <video src={content.mediaUrl} controls className="max-w-full rounded-lg mb-1" />
    ) : (
      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 mb-1">
        <Video size={16} />
        <span className="text-sm">Video</span>
      </div>
    )
  }

  return null
}

const MessageBubble = ({ message, showSender = false }) => {
  const isOutbound = message.direction === 'outbound'
  const time = formatTime(message.createdAt)
  const isSystem = message.type === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{message.content?.text}</span>
      </div>
    )
  }

  return (
    <div className={cn('flex mb-2 group', isOutbound ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%] min-w-[60px]', isOutbound ? 'items-end' : 'items-start')}>
        {showSender && message.sentBy && (
          <p className="text-[10px] text-gray-400 mb-0.5 px-1">{message.sentBy.name}</p>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm relative',
            isOutbound
              ? 'rounded-tr-sm text-gray-900'
              : 'rounded-tl-sm bg-white border border-gray-100 text-gray-900 shadow-sm',
          )}
          style={isOutbound ? {
            background: 'linear-gradient(135deg, #EDE7F6, #E3F2FD)',
            border: '1px solid rgba(123, 47, 190, 0.15)',
          } : {}}
        >
          {/* Media content */}
          {['image', 'video', 'audio', 'document'].includes(message.type) && (
            <MediaContent type={message.type} content={message.content} />
          )}

          {/* Template indicator */}
          {message.type === 'template' && (
            <div className="text-xs text-brand-purple font-semibold mb-1 opacity-70">
              Template: {message.content?.templateName}
            </div>
          )}

          {/* Text content */}
          {message.content?.text && (
            <p className="leading-relaxed whitespace-pre-wrap break-words">
              {message.content.text}
            </p>
          )}

          {/* Timestamp and status */}
          <div className={cn('flex items-center gap-1 mt-1', isOutbound ? 'justify-end' : 'justify-start')}>
            <span className="text-[10px] text-gray-400">{time}</span>
            {isOutbound && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
