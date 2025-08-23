"use client"

import { useEffect, useState } from "react"
import { getSocketStatus } from "@/lib/socketClient"

export default function SocketDebugger() {
  const [status, setStatus] = useState({ connected: false, id: null as string | null })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSocketStatus())
    }, 1000)

    // Show debugger only in development
    setIsVisible(process.env.NODE_ENV === 'development')

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white text-xs p-2 rounded">
      <div>Socket: {status.connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      {status.id && <div>ID: {status.id.slice(0, 8)}...</div>}
    </div>
  )
}
