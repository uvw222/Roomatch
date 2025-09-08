"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Calendar, Heart, Users, Check, CheckCheck } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"

export default function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    hasUnreadNotifications, 
    markAsRead, 
    markAllAsRead,
    isLoading
  } = useNotifications()
  
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_match':
        return <Heart className="h-4 w-4 text-red-500" />
      case 'meeting_request':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'meeting_approved':
        return <Check className="h-4 w-4 text-green-500" />
      case 'meeting_declined':
        return <Calendar className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNavigationPath = (notification: any) => {
    switch (notification.type) {
      case 'new_match':
        // Go to matches page to see mutual matches and start chatting
        return '/matches'
      case 'meeting_request':
        // Go to calendar to review and approve/decline the meeting
        return '/calendar'
      case 'meeting_approved':
        // Go to calendar to see the confirmed meeting details
        return '/calendar'
      case 'meeting_declined':
        // Go to calendar to see the cancelled meeting or schedule a new one
        return '/calendar'
      default:
        return '/dashboard' // Default fallback
    }
  }

  const handleNotificationClick = (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification._id)
    }

    // Close the dropdown
    setIsOpen(false)

    // Navigate to the relevant page
    const path = getNavigationPath(notification)
    router.push(path)
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {hasUnreadNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-auto p-1 text-xs hover:bg-gray-100"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="p-0 cursor-pointer hover:bg-transparent focus:bg-transparent"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`w-full p-3 hover:bg-gray-100 transition-colors border-l-2 ${
                  !notification.read 
                    ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100' 
                    : 'border-l-transparent hover:border-l-gray-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={notification.fromUser.profileImage || "/placeholder.svg"} 
                            alt={notification.fromUser.name}
                          />
                          <AvatarFallback className="text-xs">
                            {notification.fromUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {notification.fromUser.name}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 leading-tight mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-tight mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
