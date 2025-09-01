"use client"

import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"

interface UserTypeBackgroundProps {
  children: React.ReactNode
}

export default function UserTypeBackground({ children }: UserTypeBackgroundProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Don't apply user type backgrounds on these routes
  const excludePaths = ["/", "/login", "/register"]
  const shouldApplyBackground = user && !excludePaths.includes(pathname)

  if (!shouldApplyBackground) {
    return <>{children}</>
  }

  const getBackgroundClass = () => {
    if (user.userType === "landlord") {
      return "bg-blue-50 dark:bg-blue-950/20"
    } else if (user.userType === "renter") {
      return "bg-green-50 dark:bg-green-950/20"
    }
    return ""
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getBackgroundClass()}`}>
      {children}
    </div>
  )
}
