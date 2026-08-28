import { create } from 'zustand'
import { io } from 'socket.io-client'
import api from '@/lib/api'

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: () => {
    const existingSocket = get().socket
    if (existingSocket?.connected) return

    const socket = io('/', {
      // A function (not a plain object) so reconnection attempts always send
      // the current token — a plain object would keep resending whatever
      // token was captured at the first connect, even after it's refreshed.
      auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    socket.on('connect', () => {
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('connect_error', async (err) => {
      set({ isConnected: false })
      if (err.message === 'Invalid token' || err.message === 'Authentication error') {
        // Piggyback on the axios refresh flow: any authenticated call will
        // silently refresh an expired access token via its interceptor.
        try {
          await api.get('/auth/me')
          socket.connect()
        } catch (_) {
          // Refresh token is also invalid — the axios interceptor already
          // redirects to /login in that case, nothing more to do here.
        }
      }
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
