"use client"

import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { Bell } from "lucide-react"

export default function UnreadMessagesIndicator() {
  const { hasUnreadMessages } = useUnreadMessages()

  if (!hasUnreadMessages) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <Bell className="h-6 w-6 text-orange-500 animate-pulse" />
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}
