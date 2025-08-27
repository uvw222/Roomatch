"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import MatchNotification from './MatchNotification'
import { getSocketClient } from '@/lib/socketClient'

interface MatchData {
  name: string
  userType: string
  profileImage?: string
  email: string
  isNotification?: boolean
}

export default function GlobalMatchNotification() {
  const router = useRouter()
  const { user } = useAuth()
  const [showNotification, setShowNotification] = useState(false)
  const [matchData, setMatchData] = useState<MatchData | null>(null)

  useEffect(() => {
    if (!user?.email) return

    try {
      // Connect to socket and join user's room
      const socket = getSocketClient(user.email)

      if (socket) {
        // Listen for new match notifications
        const handleNewMatch = (data: { type: string; match: MatchData }) => {
          if (data.type === 'newMatch') {
            setMatchData(data.match)
            setShowNotification(true)
          }
        }

        socket.on('newMatch', handleNewMatch)

        return () => {
          socket.off('newMatch', handleNewMatch)
        }
      }
    } catch (error) {
      console.error('Error setting up socket connection:', error)
    }
  }, [user?.email])

  // Listen for immediate match notifications from swipe actions
  useEffect(() => {
    const handleShowMatchNotification = (event: CustomEvent) => {
      const match = event.detail.match
      if (match) {
        setMatchData(match)
        setShowNotification(true)
      }
    }

    window.addEventListener('showMatchNotification', handleShowMatchNotification as EventListener)

    return () => {
      window.removeEventListener('showMatchNotification', handleShowMatchNotification as EventListener)
    }
  }, [])

  // Check for new matches when user logs in
  useEffect(() => {
    if (!user?.email) return

    const checkNewMatches = async () => {
      try {
        const res = await fetch('/api/matches/new-since-login', {
          credentials: 'include'
        })
        const data = await res.json()
        
        if (data.success && data.newMatches.length > 0) {
          // Show notification for the most recent new match or notification
          const latestMatch = data.newMatches[0]
          setMatchData({
            name: latestMatch.name,
            userType: latestMatch.userType,
            profileImage: latestMatch.profileImage,
            email: latestMatch.email,
            isNotification: latestMatch.isNotification
          })
          setShowNotification(true)
        }
      } catch (error) {
        console.error('Error checking for new matches:', error)
      }
    }

    // Check for new matches after a short delay to ensure user is fully loaded
    const timer = setTimeout(checkNewMatches, 2000)
    return () => clearTimeout(timer)
  }, [user?.email])

  const handleClose = () => {
    setShowNotification(false)
    setMatchData(null)
  }

  const handleViewProfile = (email: string) => {
    router.push(`/profile/${email}`)
    handleClose()
  }

  const handleStartChat = (email: string) => {
    router.push(`/chat?other=${encodeURIComponent(email)}`)
    handleClose()
  }

  return (
    <MatchNotification
      isVisible={showNotification}
      matchData={matchData}
      onClose={handleClose}
      onViewProfile={handleViewProfile}
      onStartChat={handleStartChat}
    />
  )
}
