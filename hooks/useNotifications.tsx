"use client"

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getSocketClient } from '@/lib/socketClient'

export interface Notification {
  _id: string
  type: 'new_match' | 'meeting_request' | 'meeting_approved' | 'meeting_declined'
  title: string
  message: string
  fromUser: {
    email: string
    name: string
    profileImage?: string
  }
  data?: any // Additional data specific to notification type
  read: boolean
  createdAt: Date
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  hasUnreadNotifications: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  isLoading: boolean
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return

    try {
      setIsLoading(true)
      const res = await fetch('/api/notifications', {
        credentials: 'include'
      })
      const data = await res.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.email])

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.email) return

    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
        credentials: 'include'
      })

      if (res.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [user?.email])

  const markAllAsRead = useCallback(async () => {
    if (!user?.email) return

    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      })

      if (res.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [user?.email])

  // Set up socket listener for real-time notifications
  useEffect(() => {
    if (!user?.email) return

    const socket = getSocketClient(user.email)
    if (socket) {
      const handleNewNotification = (notification: Notification) => {
        if (notification.fromUser.email !== user.email) {
          setNotifications(prev => [notification, ...prev])
          
          // Play notification sound
          try {
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {
              // Ignore errors if audio can't play
            })
          } catch (error) {
            // Ignore audio errors
          }
        }
      }

      const handleNotificationRead = () => {
        // Refresh notifications when marked as read
        refreshNotifications()
      }

      socket.on('notification:new', handleNewNotification)
      socket.on('notification:read', handleNotificationRead)

      return () => {
        socket.off('notification:new', handleNewNotification)
        socket.off('notification:read', handleNotificationRead)
      }
    }
  }, [user?.email, refreshNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Computed values
  const unreadCount = notifications.filter(notif => !notif.read).length
  const hasUnreadNotifications = unreadCount > 0

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    hasUnreadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    isLoading
  }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
