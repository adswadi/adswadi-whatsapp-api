import { create } from 'zustand'
import { io } from 'socket.io-client'

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: (token) => {
    const existingSocket = get().socket
    if (existingSocket?.connected) return

    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message)
      set({ isConnected: false })
    })

    socket.on('notification', (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50),
      }))
    })

    set({ socket })
  },

  disconnect: () => {
    const socket = get().socket
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false })
    }
  },

  emit: (event, data) => {
    const socket = get().socket
    if (socket?.connected) {
      socket.emit(event, data)
    }
  },

  on: (event, callback) => {
    const socket = get().socket
    if (socket) {
      socket.on(event, callback)
    }
  },

  off: (event, callback) => {
    const socket = get().socket
    if (socket) {
      socket.off(event, callback)
    }
  },

  clearNotifications: () => set({ notifications: [] }),
}))

export default useSocketStore
