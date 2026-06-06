import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SERVERS, FAILOVER_CONFIG, APP_CONFIG } from '../config/servers.js'

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────
      isAuthenticated: false,
      currentServer: null,
      serverIndex: 0,
      userInfo: null,

      login: (server, userInfo) => set({
        isAuthenticated: true,
        currentServer: server,
        userInfo,
      }),

      logout: () => set({
        isAuthenticated: false,
        currentServer: null,
        userInfo: null,
        serverIndex: 0,
      }),

      // ── Failover ──────────────────────────────────────────
      activeServers: SERVERS.filter(s => s.active),
      currentServerIndex: 0,

      getNextServer: () => {
        const { activeServers, currentServerIndex } = get()
        const nextIndex = currentServerIndex + 1
        if (nextIndex < activeServers.length) {
          set({ currentServerIndex: nextIndex, currentServer: activeServers[nextIndex] })
          return activeServers[nextIndex]
        }
        return null
      },

      resetServerIndex: () => set({ currentServerIndex: 0 }),

      // ── Favoritos ─────────────────────────────────────────
      favorites: { movies: [], series: [], channels: [] },

      toggleFavorite: (type, item) => {
        const { favorites } = get()
        const list = favorites[type] || []
        const exists = list.find(i => i.stream_id === item.stream_id || i.series_id === item.series_id)
        set({
          favorites: {
            ...favorites,
            [type]: exists
              ? list.filter(i => (i.stream_id || i.series_id) !== (item.stream_id || item.series_id))
              : [item, ...list],
          },
        })
        return !exists
      },

      isFavorite: (type, id) => {
        const list = get().favorites[type] || []
        return list.some(i => i.stream_id === id || i.series_id === id)
      },

      // ── Histórico ─────────────────────────────────────────
      watchHistory: [],

      addToHistory: (item) => {
        const { watchHistory } = get()
        const filtered = watchHistory.filter(i => i.id !== item.id)
        set({ watchHistory: [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, 50) })
      },

      updateProgress: (id, progress) => {
        const { watchHistory } = get()
        set({
          watchHistory: watchHistory.map(i =>
            i.id === id ? { ...i, progress } : i
          ),
        })
      },

      getProgress: (id) => {
        const item = get().watchHistory.find(i => i.id === id)
        return item?.progress || 0
      },

      // ── Preferências ─────────────────────────────────────
      preferences: {
        volume: APP_CONFIG.defaultVolume,
        quality: 'auto',
        autoplay: true,
      },

      setPreference: (key, value) => set(state => ({
        preferences: { ...state.preferences, [key]: value },
      })),

      // ── Toast ─────────────────────────────────────────────
      toasts: [],

      addToast: (toast) => {
        const id = Date.now()
        set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
        setTimeout(() => {
          set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
        }, toast.duration || 4000)
      },

      removeToast: (id) => set(state => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),

      // ── Busca ────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // ── Loading global ───────────────────────────────────
      isLoading: false,
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'msplay-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentServer: state.currentServer,
        favorites: state.favorites,
        watchHistory: state.watchHistory,
        preferences: state.preferences,
        userInfo: state.userInfo,
      }),
    }
  )
)

export default useAppStore
