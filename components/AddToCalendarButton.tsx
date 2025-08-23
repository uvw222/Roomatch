"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { CalendarIntegration, CalendarEvent } from '@/lib/calendarIntegration'

interface AddToCalendarButtonProps {
  event: CalendarEvent
  userEmail?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export default function AddToCalendarButton({ 
  event, 
  userEmail, 
  className = "",
  variant = "outline",
  size = "sm"
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAddToCalendar = (calendarType: string) => {
    switch (calendarType) {
      case 'Google Calendar':
        window.open(CalendarIntegration.generateGoogleCalendarUrl(event), '_blank')
        break
      case 'Outlook Calendar':
        window.open(CalendarIntegration.generateOutlookCalendarUrl(event), '_blank')
        break
      case 'Apple Calendar':
        CalendarIntegration.downloadICSFile(event)
        break
      case 'Yahoo Calendar':
        window.open(CalendarIntegration.generateYahooCalendarUrl(event), '_blank')
        break
      default:
        CalendarIntegration.addToCalendar(event, userEmail)
        break
    }
    setIsOpen(false)
  }

  const getCalendarOptions = () => {
    const options = [
      {
        name: 'Google Calendar',
        icon: '📅',
        description: 'Add to Google Calendar'
      },
      {
        name: 'Outlook Calendar',
        icon: '📧',
        description: 'Add to Outlook Calendar'
      },
      {
        name: 'Apple Calendar',
        icon: '🍎',
        description: 'Download for Apple Calendar'
      },
      {
        name: 'Yahoo Calendar',
        icon: '📮',
        description: 'Add to Yahoo Calendar'
      }
    ]

    // If user has a specific email domain, prioritize that calendar
    if (userEmail) {
      const domain = userEmail.split('@')[1]?.toLowerCase()
      const priorityMap: { [key: string]: string } = {
        'outlook.com': 'Outlook Calendar',
        'hotmail.com': 'Outlook Calendar',
        'live.com': 'Outlook Calendar',
        'yahoo.com': 'Yahoo Calendar',
        'icloud.com': 'Apple Calendar',
        'me.com': 'Apple Calendar',
        'mac.com': 'Apple Calendar'
      }

      const priorityCalendar = priorityMap[domain]
      if (priorityCalendar) {
        const priorityOption = options.find(opt => opt.name === priorityCalendar)
        const otherOptions = options.filter(opt => opt.name !== priorityCalendar)
        return [priorityOption!, ...otherOptions]
      }
    }

    return options
  }

  const calendarOptions = getCalendarOptions()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Add to Calendar
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {calendarOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={() => handleAddToCalendar(option.name)}
            className="cursor-pointer"
          >
            <span className="mr-2">{option.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium">{option.name}</span>
              <span className="text-xs text-gray-500">{option.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
