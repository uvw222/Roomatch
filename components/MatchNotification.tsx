"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, X, MessageCircle, User } from 'lucide-react'
import Confetti from './Confetti'

interface MatchNotificationProps {
  isVisible: boolean
  matchData: {
    name: string
    userType: string
    profileImage?: string
    email: string
    isNotification?: boolean
  } | null
  onClose: () => void
  onViewProfile: (email: string) => void
  onStartChat: (email: string) => void
}

export default function MatchNotification({
  isVisible,
  matchData,
  onClose,
  onViewProfile,
  onStartChat
}: MatchNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible && matchData) {
      setShowConfetti(true)
      
      // Mark notification as read if it's from stored notifications
      if (matchData.isNotification) {
        markNotificationAsRead(matchData.email)
      }
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, matchData, onClose])

  const markNotificationAsRead = async (matchEmail: string) => {
    try {
      await fetch('/api/matches/mark-notifications-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchEmail }),
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleConfettiComplete = () => {
    setShowConfetti(false)
  }

  if (!isVisible || !matchData) return null

  return (
    <>
      <Confetti isActive={showConfetti} onComplete={handleConfettiComplete} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
          <Card className="w-full max-w-md bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
                    <Heart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">It's a Match! 🎉</h3>
                    <p className="text-sm text-slate-600">You matched with {matchData.name}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Match Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-white/60 rounded-lg border border-orange-200">
                <div className="flex-shrink-0">
                  {matchData.profileImage ? (
                    <img
                      src={matchData.profileImage}
                      alt={matchData.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center border-2 border-orange-200">
                      <User className="h-8 w-8 text-orange-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{matchData.name}</h4>
                  <p className="text-sm text-slate-600 capitalize">{matchData.userType}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Heart className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">Mutual Match</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onViewProfile(matchData.email)}
                  variant="outline"
                  className="flex-1 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button
                  onClick={() => onStartChat(matchData.email)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
