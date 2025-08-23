export interface CalendarEvent {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  attendees?: string[]
}

export class CalendarIntegration {
  /**
   * Generate Google Calendar URL
   */
  static generateGoogleCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
      details: event.description,
      location: event.location,
      ...(event.attendees && { add: event.attendees.join(',') })
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  /**
   * Generate Outlook Calendar URL
   */
  static generateOutlookCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: event.title,
      startdt: formatDate(event.startDate),
      enddt: formatDate(event.endDate),
      body: event.description,
      location: event.location,
      ...(event.attendees && { to: event.attendees.join(',') })
    })

    return `https://outlook.live.com/calendar/0/${params.toString()}`
  }

  /**
   * Generate Apple Calendar URL
   */
  static generateAppleCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      title: event.title,
      description: event.description,
      start: formatDate(event.startDate),
      end: formatDate(event.endDate),
      location: event.location,
      ...(event.attendees && { attendees: event.attendees.join(',') })
    })

    return `data:text/calendar;charset=utf8,${encodeURIComponent(
      `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
LOCATION:${event.location}
${event.attendees ? event.attendees.map(email => `ATTENDEE:mailto:${email}`).join('\n') : ''}
END:VEVENT
END:VCALENDAR`
    )}`
  }

  /**
   * Generate Yahoo Calendar URL
   */
  static generateYahooCalendarUrl(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      title: event.title,
      desc: event.description,
      in_loc: event.location,
      st: formatDate(event.startDate),
      et: formatDate(event.endDate),
      ...(event.attendees && { inv_list: event.attendees.join(',') })
    })

    return `https://calendar.yahoo.com/?v=60&${params.toString()}`
  }

  /**
   * Add event to calendar based on user's email domain
   */
  static addToCalendar(event: CalendarEvent, userEmail?: string): void {
    if (!userEmail) {
      // Default to Google Calendar if no email provided
      window.open(this.generateGoogleCalendarUrl(event), '_blank')
      return
    }

    const domain = userEmail.split('@')[1]?.toLowerCase()

    switch (domain) {
      case 'outlook.com':
      case 'hotmail.com':
      case 'live.com':
        window.open(this.generateOutlookCalendarUrl(event), '_blank')
        break
      case 'yahoo.com':
        window.open(this.generateYahooCalendarUrl(event), '_blank')
        break
      case 'icloud.com':
      case 'me.com':
      case 'mac.com':
        // Apple Calendar - download .ics file
        this.downloadICSFile(event)
        break
      default:
        // Default to Google Calendar for other domains
        window.open(this.generateGoogleCalendarUrl(event), '_blank')
        break
    }
  }

  /**
   * Download ICS file for Apple Calendar
   */
  static downloadICSFile(event: CalendarEvent): void {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RoomMatch//Calendar Event//EN
BEGIN:VEVENT
UID:${Date.now()}@roommatch.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
${event.attendees ? event.attendees.map(email => `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${email}`).join('\n') : ''}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Get calendar provider options based on email
   */
  static getCalendarOptions(userEmail?: string): Array<{
    name: string
    icon: string
    action: () => void
  }> {
    const event = this.getCurrentEvent()
    if (!event) return []

    const options = [
      {
        name: 'Google Calendar',
        icon: '📅',
        action: () => window.open(this.generateGoogleCalendarUrl(event), '_blank')
      },
      {
        name: 'Outlook Calendar',
        icon: '📧',
        action: () => window.open(this.generateOutlookCalendarUrl(event), '_blank')
      },
      {
        name: 'Apple Calendar',
        icon: '🍎',
        action: () => this.downloadICSFile(event)
      },
      {
        name: 'Yahoo Calendar',
        icon: '📮',
        action: () => window.open(this.generateYahooCalendarUrl(event), '_blank')
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

  /**
   * Get current event from localStorage or context
   */
  private static getCurrentEvent(): CalendarEvent | null {
    // This would be implemented based on your app's state management
    // For now, return null - this will be set by the calendar component
    return null
  }
}
