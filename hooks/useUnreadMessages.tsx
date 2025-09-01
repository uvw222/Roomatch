"use client"

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useAuth } from './useAuth'
import { getSocketClient } from '@/lib/socketClient'

interface UnreadMessagesContextType {
  unreadCount: number
  hasUnreadMessages: boolean
  refreshUnreadCount: () => Promise<void>
  markMessagesAsRead: (messageIds: string[]) => Promise<void>
  markConversationAsRead: (otherEmail: string) => Promise<void>
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined)

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.email) return

    try {
      const res = await fetch('/api/messages/unread-count', {
        credentials: 'include'
      })
      const data = await res.json()
      
      if (data.success) {
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [user?.email])

  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount()
  }, [fetchUnreadCount])

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!user?.email || messageIds.length === 0) return

    try {
      const res = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds }),
        credentials: 'include'
      })

      if (res.ok) {
        // Update local count
        setUnreadCount(prev => Math.max(0, prev - messageIds.length))
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [user?.email])

  const markConversationAsRead = useCallback(async (otherEmail: string) => {
    if (!user?.email) return

    try {
      const res = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ other: otherEmail }),
        credentials: 'include'
      })

      if (res.ok) {
        // Refresh the count since we don't know exactly how many were marked
        await refreshUnreadCount()
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }, [user?.email, refreshUnreadCount])

  // Set up socket listener for new messages
  useEffect(() => {
    if (!user?.email) return

    const socket = getSocketClient(user.email)
    if (socket) {
      const handleNewMessage = (message: any) => {
        if (message.to === user.email) {
          setUnreadCount(prev => prev + 1)
          
          // Play notification sound for new messages
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

      const handleMessagesRead = () => {
        // Refresh count when messages are marked as read
        refreshUnreadCount()
      }

      socket.on('messages:new', handleNewMessage)
      socket.on('messages:read', handleMessagesRead)

      return () => {
        socket.off('messages:new', handleNewMessage)
        socket.off('messages:read', handleMessagesRead)
      }
    }
  }, [user?.email, refreshUnreadCount])

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Refresh count when user changes
  useEffect(() => {
    if (user?.email) {
      fetchUnreadCount()
    }
  }, [user?.email, fetchUnreadCount])

  const value: UnreadMessagesContextType = {
    unreadCount,
    hasUnreadMessages: unreadCount > 0,
    refreshUnreadCount,
    markMessagesAsRead,
    markConversationAsRead
  }

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  )
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext)
  if (context === undefined) {
    throw new Error('useUnreadMessages must be used within an UnreadMessagesProvider')
  }
  return context
}
