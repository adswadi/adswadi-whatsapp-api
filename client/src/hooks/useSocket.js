import { useEffect, useCallback } from 'react'
import useSocketStore from '@/store/socketStore'

export const useSocket = () => {
  const { socket, isConnected, on, off, emit } = useSocketStore()
  return { socket, isConnected, on, off, emit }
}

export const useSocketEvent = (event, callback) => {
  const { socket } = useSocketStore()

  useEffect(() => {
    if (!socket) return
    socket.on(event, callback)
    return () => socket.off(event, callback)
  }, [socket, event, callback])
}

export const useConversationSocket = (conversationId) => {
  const { socket, emit } = useSocketStore()

  useEffect(() => {
    if (!socket || !conversationId) return
    emit('join_conversation', conversationId)
    return () => emit('leave_conversation', conversationId)
  }, [socket, conversationId])
}
