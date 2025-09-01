"use client"

import { useEffect, useRef } from 'react'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

export default function NotificationSound() {
  const { unreadCount } = useUnreadMessages()
  const previousCount = useRef(unreadCount)

  useEffect(() => {
    // Only play sound when count increases (new message)
    if (unreadCount > previousCount.current) {
      playNotificationSound()
    }
    previousCount.current = unreadCount
  }, [unreadCount])

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      // Fallback: try to play a simple audio file if available
      try {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore errors if audio can't play
        })
      } catch (fallbackError) {
        // Ignore all audio errors
      }
    }
  }

  return null // This component doesn't render anything
}
