"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, MapPin, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import AddToCalendarButton from "@/components/AddToCalendarButton"
import { CalendarEvent } from "@/lib/calendarIntegration"

type Meeting = {
  id: number
  date: Date
  time: string
  location: string
  address: string
  with: string
  notes: string
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [userEmail, setUserEmail] = useState<string>("")
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      date: new Date(2023, 4, 15),
      time: "14:00",
      location: "Coffee Shop",
      address: "123 Main St",
      with: "Sarah Johnson",
      notes: "Discussing potential roommate arrangement for downtown apartment.",
    },
    {
      id: 2,
      date: new Date(2023, 4, 18),
      time: "16:30",
      location: "Apartment Viewing",
      address: "456 Park Ave, Apt 302",
      with: "Michael Brown",
      notes: "Viewing the apartment together to see if it's a good fit for both of us.",
    },
    {
      id: 3,
      date: new Date(2023, 4, 20),
      time: "11:00",
      location: "Video Call",
      address: "Zoom",
      with: "Emily Davis",
      notes: "Initial meeting to discuss living preferences and potential compatibility.",
    },
  ])

  const [newMeeting, setNewMeeting] = useState<Omit<Meeting, "id">>({
    date: new Date(),
    time: "",
    location: "",
    address: "",
    with: "",
    notes: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get user email from localStorage or cookies
  useState(() => {
    const storedEmail = localStorage.getItem('userEmail') || 
                       document.cookie.split('; ').find(row => row.startsWith('user_email='))?.split('=')[1]
    if (storedEmail) {
      setUserEmail(storedEmail)
    }
  })

  const handleAddMeeting = () => {
    const meeting = {
      ...newMeeting,
      id: meetings.length + 1,
    }

    setMeetings([...meetings, meeting])
    setIsDialogOpen(false)
    setNewMeeting({
      date: new Date(),
      time: "",
      location: "",
      address: "",
      with: "",
      notes: "",
    })
  }

  const convertMeetingToCalendarEvent = (meeting: Meeting): CalendarEvent => {
    const [hours, minutes] = meeting.time.split(':').map(Number)
    const startDate = new Date(meeting.date)
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setHours(hours + 1, minutes, 0, 0) // Default 1 hour duration

    return {
      title: `Meeting with ${meeting.with}`,
      description: meeting.notes,
      startDate,
      endDate,
      location: `${meeting.location} - ${meeting.address}`,
      attendees: [userEmail, meeting.with].filter(Boolean)
    }
  }

  const filteredMeetings = date
    ? meetings.filter(
        (meeting) =>
          meeting.date.getDate() === date.getDate() &&
          meeting.date.getMonth() === date.getMonth() &&
          meeting.date.getFullYear() === date.getFullYear(),
      )
    : []

  return (
    <div className="flex flex-col h-full pt-safe pb-safe">
      <div className="container px-4 py-4 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-500">Schedule and manage your roommate meetings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule a Meeting</DialogTitle>
                <DialogDescription>Add details for your roommate meeting</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-date" className="text-right">
                    Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newMeeting.date ? format(newMeeting.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newMeeting.date}
                          onSelect={(date) => setNewMeeting({ ...newMeeting, date: date || new Date() })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="meeting-time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-with" className="text-right">
                    Meeting With
                  </Label>
                  <Input
                    id="meeting-with"
                    value={newMeeting.with}
                    onChange={(e) => setNewMeeting({ ...newMeeting, with: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-location" className="text-right">
                    Location Type
                  </Label>
                  <Select
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, location: value })}
                    defaultValue={newMeeting.location}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coffee Shop">Coffee Shop</SelectItem>
                      <SelectItem value="Apartment Viewing">Apartment Viewing</SelectItem>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="meeting-address"
                    value={newMeeting.address}
                    onChange={(e) => setNewMeeting({ ...newMeeting, address: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="meeting-notes"
                    value={newMeeting.notes}
                    onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAddMeeting}>
                  Schedule Meeting
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 flex-1 overflow-auto">
          <Card>
            <CardContent className="p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          <div className="space-y-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>{date ? format(date, "MMMM d, yyyy") : "Select a date"}</CardTitle>
                <CardDescription>
                  {filteredMeetings.length === 0
                    ? "No meetings scheduled for this day"
                    : `${filteredMeetings.length} meeting${filteredMeetings.length > 1 ? "s" : ""} scheduled`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="font-medium text-lg mb-1">No Meetings</h3>
                    <p className="text-gray-500 max-w-sm">
                      You don't have any meetings scheduled for this day. Click "Add Meeting" to schedule one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMeetings.map((meeting) => (
                      <div key={meeting.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg">Meeting with {meeting.with}</h3>
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{meeting.time}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-gray-500">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <div>
                            <p className="font-medium">{meeting.location}</p>
                            <p>{meeting.address}</p>
                          </div>
                        </div>
                        {meeting.notes && <p className="text-gray-600 border-t pt-2 mt-2">{meeting.notes}</p>}
                        <div className="flex gap-2 mt-4">
                          <AddToCalendarButton 
                            event={convertMeetingToCalendarEvent(meeting)}
                            userEmail={userEmail}
                            variant="outline"
                            size="sm"
                          />
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="text-orange-500 hover:text-orange-600">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>Your next scheduled meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings
                    .filter((meeting) => meeting.date >= new Date())
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 3)
                    .map((meeting) => (
                      <div key={meeting.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="font-medium truncate">{meeting.with}</p>
                            <p className="text-sm text-gray-500">{format(meeting.date, "MMM d")}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{meeting.location}</span>
                          </div>
                          <div className="mt-2">
                            <AddToCalendarButton 
                              event={convertMeetingToCalendarEvent(meeting)}
                              userEmail={userEmail}
                              variant="ghost"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
