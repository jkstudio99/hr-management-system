// ─────────────────────────────────────────────────────────────────────────────
// stores/notifications.ts — Pinia store for in-app notifications
// ─────────────────────────────────────────────────────────────────────────────
import { defineStore } from 'pinia'
import type { Notification } from '~/types/hr'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as Notification[],
    unreadCount: 0,
    loading: false,
  }),

  getters: {
    unread: (state) => state.items.filter(n => !n.isRead),
    hasUnread: (state) => state.unreadCount > 0,
  },

  actions: {
    async fetch() {
      this.loading = true
      try {
        const api = useApiService()
        const res = await api.notifications.list()
        this.items = res.data
        this.unreadCount = res.data.filter(n => !n.isRead).length
      } catch {
        // silent fail — notifications are non-critical
      } finally {
        this.loading = false
      }
    },

    async markRead(id: number) {
      try {
        const api = useApiService()
        await api.notifications.markRead(id)
        const item = this.items.find(n => n.id === id)
        if (item) {
          item.isRead = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      } catch {}
    },

    async markAllRead() {
      try {
        const api = useApiService()
        await api.notifications.markAllRead()
        this.items.forEach(n => { n.isRead = true })
        this.unreadCount = 0
      } catch {}
    },

    async remove(id: number) {
      try {
        const api = useApiService()
        await api.notifications.remove(id)
        const idx = this.items.findIndex(n => n.id === id)
        if (idx !== -1) {
          if (!this.items[idx].isRead) this.unreadCount = Math.max(0, this.unreadCount - 1)
          this.items.splice(idx, 1)
        }
      } catch {}
    },
  },
})
