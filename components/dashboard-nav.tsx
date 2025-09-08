"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, Heart, Home, LogOut, Menu, MessageCircle, Settings, User, Edit, Users, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useProfileImage } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { getSocketClient } from "@/lib/socketClient"
import NotificationBell from "@/components/NotificationBell"

export default function DashboardNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { profileImage, isLoading, refreshProfileImage } = useProfileImage()
  const { logout, user } = useAuth()
  const { hasUnreadMessages } = useUnreadMessages()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  // Clear notifications when navigating to chat page
  useEffect(() => {
    // This effect is now handled by the useUnreadMessages hook
  }, [pathname]);

  // Refresh profile image when pathname changes (e.g., when returning from profile edit)
  useEffect(() => {
    // Only refresh when navigating to dashboard or after profile edit
    if (pathname === '/dashboard' || pathname === '/profile/edit') {
      refreshProfileImage()
    }
  }, [pathname, refreshProfileImage])

  const routes = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { name: "Find Match", path: "/match", icon: <Heart className="h-5 w-5" /> },
    { name: "My Matches", path: "/matches", icon: <Sparkles className="h-5 w-5" /> },
    { name: "Likes", path: "/likes", icon: <Users className="h-5 w-5" /> },
    { 
      name: "RooChat", 
      path: "/chat", 
      icon: (
        <div className="relative">
          <MessageCircle className="h-5 w-5" />
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
          )}
        </div>
      )
    },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="h-5 w-5" /> },
    { name: "My Profile", path: "/profile/me", icon: <User className="h-5 w-5" /> },
  ]

  return (
    <header className="border-b sticky top-0 bg-background z-50 pt-safe">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-orange-600 transition-colors">
          <Home className="h-5 w-5 text-orange-500" />
          <span>RoomMatch</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-orange-600 ${
                pathname === route.path ? "text-orange-600" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {route.icon}
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Unread Messages Indicator */}
          <div className="hidden md:flex items-center gap-2">
            {hasUnreadMessages && (
              <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">New messages</span>
              </div>
            )}
          </div>
          <NotificationBell />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={profileImage || "/placeholder.svg"}
                    alt="User"
                  />
                  <AvatarFallback>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      "RM"
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/me" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/edit" className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/matches" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>My Matches</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/likes" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>My Likes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
  <LogOut className="mr-2 h-4 w-4" />
  <span>Log out</span>
</DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden relative">
                <Menu className="h-5 w-5" />
                {hasUnreadMessages && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-orange-600 transition-colors">
                    <Home className="h-5 w-5 text-orange-500" />
                    <span>RoomMatch</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                <nav className="flex flex-col gap-4">
                  {routes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 text-sm font-medium transition-colors hover:text-orange-600 ${
                        pathname === route.path ? "text-orange-600" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {route.icon}
                      {route.name}
                    </Link>
                  ))}
                  <button
  onClick={() => {
    setIsOpen(false)
    handleLogout()
  }}
  className="flex items-center gap-3 text-sm font-medium text-red-500 mt-4"
>
  <LogOut className="h-5 w-5" />
  Log out
</button>

                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
