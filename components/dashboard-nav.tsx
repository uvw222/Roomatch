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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, Heart, Home, LogOut, Menu, MessageCircle, Settings, User, Edit } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useProfileImage } from "@/hooks/useProfile"

export default function DashboardNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { profileImage, isLoading, refreshProfileImage } = useProfileImage()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, { method: "POST" })
    router.push("/login")
  }

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
    { name: "RooChat", path: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
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

        <nav className="hidden md:flex items-center gap-6">
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
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-orange-600 transition-colors">
                  <Home className="h-5 w-5 text-orange-500" />
                  <span>RoomMatch</span>
                </Link>
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
