"use client"

import Link from "next/link"
import { Heart, Home, MessageCircle, Calendar, User, Users } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()

  const routes = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Match", path: "/match", icon: <Heart className="h-5 w-5" /> },
    { name: "Likes", path: "/likes", icon: <Users className="h-5 w-5" /> },
    { name: "Chat", path: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="h-5 w-5" /> },
    { name: "Profile", path: "/profile/me", icon: <User className="h-5 w-5" /> },
  ]

  // Hide footer on these routes
  const hideOnPaths = ["/", "/login", "/register"]
  const showFooter = !hideOnPaths.includes(pathname ?? "")

  if (!showFooter) {
    return null
  }

  return (
    <footer className="border-t bg-background sticky bottom-0 z-50 pb-safe lg:hidden">
      <nav className="container flex items-center justify-around px-4 py-3">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors hover:text-orange-600 ${
              pathname === route.path 
                ? "text-orange-600" 
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {route.icon}
            <span className="text-[10px]">{route.name}</span>
          </Link>
        ))}
      </nav>
    </footer>
  )
}
