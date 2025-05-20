"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { Calendar, Heart, Home, LogOut, Menu, MessageCircle, Settings, User } from "lucide-react"

export default function DashboardNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Find Match",
      path: "/match",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      name: "RooChat",
      path: "/chat",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile/edit",
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <header className="border-b sticky top-0 bg-background z-50 pt-safe">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Home className="h-5 w-5 text-orange-500" />
          <span>RoomMatch</span>
        </div>

        {/* Desktop Navigation */}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32&text=AJ" alt="User" />
                  <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/edit" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                  <Home className="h-5 w-5 text-orange-500" />
                  <span>RoomMatch</span>
                </div>
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
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-red-500 mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
