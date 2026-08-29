import { create } from 'zustand'

const useSubscriptionStore = create((set) => ({
  expiredModalOpen: false,
  expiredMessage: '',
  showExpiredModal: (message) => set({ expiredModalOpen: true, expiredMessage: message || '' }),
  hideExpiredModal: () => set({ expiredModalOpen: false }),
}))

export default useSubscriptionStore
