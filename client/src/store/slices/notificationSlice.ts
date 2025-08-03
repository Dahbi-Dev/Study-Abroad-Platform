import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nanoid } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  persistent?: boolean
  actionLabel?: string
  actionUrl?: string
  userId?: string
  agencyId?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  settings: {
    enableSound: boolean
    enableDesktop: boolean
    enableEmail: boolean
    maxNotifications: number
  }
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    enableSound: JSON.parse(localStorage.getItem('notificationSound') || 'true'),
    enableDesktop: JSON.parse(localStorage.getItem('notificationDesktop') || 'true'),
    enableEmail: JSON.parse(localStorage.getItem('notificationEmail') || 'true'),
    maxNotifications: 50,
  },
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: {
      reducer: (state, action: PayloadAction<Notification>) => {
        const notification = action.payload
        
        // Add to beginning of array
        state.notifications.unshift(notification)
        
        // Update unread count
        if (!notification.read) {
          state.unreadCount += 1
        }
        
        // Limit total notifications
        if (state.notifications.length > state.settings.maxNotifications) {
          const removed = state.notifications.splice(state.settings.maxNotifications)
          // Adjust unread count for removed notifications
          const removedUnread = removed.filter(n => !n.read).length
          state.unreadCount = Math.max(0, state.unreadCount - removedUnread)
        }
      },
      prepare: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => ({
        payload: {
          id: nanoid(),
          timestamp: Date.now(),
          read: false,
          ...notification,
        },
      }),
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    clearOldNotifications: (state, action: PayloadAction<number>) => {
      const cutoffTime = Date.now() - action.payload
      const oldNotifications = state.notifications.filter(n => n.timestamp < cutoffTime && !n.persistent)
      const unreadRemoved = oldNotifications.filter(n => !n.read).length
      
      state.notifications = state.notifications.filter(n => n.timestamp >= cutoffTime || n.persistent)
      state.unreadCount = Math.max(0, state.unreadCount - unreadRemoved)
    },
    updateSettings: (state, action: PayloadAction<Partial<NotificationState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload }
      
      // Store in localStorage
      if (action.payload.enableSound !== undefined) {
        localStorage.setItem('notificationSound', JSON.stringify(action.payload.enableSound))
      }
      if (action.payload.enableDesktop !== undefined) {
        localStorage.setItem('notificationDesktop', JSON.stringify(action.payload.enableDesktop))
      }
      if (action.payload.enableEmail !== undefined) {
        localStorage.setItem('notificationEmail', JSON.stringify(action.payload.enableEmail))
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    // Bulk operations
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload
      
      // Add all notifications
      state.notifications.unshift(...newNotifications)
      
      // Update unread count
      const newUnread = newNotifications.filter(n => !n.read).length
      state.unreadCount += newUnread
      
      // Limit total notifications
      if (state.notifications.length > state.settings.maxNotifications) {
        const removed = state.notifications.splice(state.settings.maxNotifications)
        const removedUnread = removed.filter(n => !n.read).length
        state.unreadCount = Math.max(0, state.unreadCount - removedUnread)
      }
    },
    markMultipleAsRead: (state, action: PayloadAction<string[]>) => {
      const ids = action.payload
      let markedCount = 0
      
      state.notifications.forEach(notification => {
        if (ids.includes(notification.id) && !notification.read) {
          notification.read = true
          markedCount += 1
        }
      })
      
      state.unreadCount = Math.max(0, state.unreadCount - markedCount)
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  clearOldNotifications,
  updateSettings,
  setLoading,
  setError,
  addNotifications,
  markMultipleAsRead,
} = notificationSlice.actions

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount
export const selectNotificationSettings = (state: { notifications: NotificationState }) => state.notifications.settings
export const selectNotificationLoading = (state: { notifications: NotificationState }) => state.notifications.isLoading
export const selectNotificationError = (state: { notifications: NotificationState }) => state.notifications.error

// Helper selectors
export const selectUnreadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter(n => !n.read)

export const selectNotificationsByType = (type: Notification['type']) => 
  (state: { notifications: NotificationState }) => 
    state.notifications.notifications.filter(n => n.type === type)

export const selectRecentNotifications = (hours: number = 24) => 
  (state: { notifications: NotificationState }) => {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000)
    return state.notifications.notifications.filter(n => n.timestamp > cutoff)
  }

export const selectNotificationById = (id: string) => 
  (state: { notifications: NotificationState }) => 
    state.notifications.notifications.find(n => n.id === id)

export default notificationSlice.reducer