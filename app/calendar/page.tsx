"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon, Clock, MapPin, Plus, Users, Edit3, Trash2, ExternalLink } from "lucide-react"
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
  const [meetings, setMeetings] = useState<Meeting[]>([])

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
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail') || 
                         document.cookie.split('; ').find(row => row.startsWith('user_email='))?.split('=')[1]
      if (storedEmail) {
        setUserEmail(storedEmail)
      }
    }
  }, [])

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Calendar
            </h1>
            <p className="text-slate-600 text-lg">Schedule and manage your roommate meetings</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-800">Schedule a Meeting</DialogTitle>
                    <DialogDescription className="text-slate-600">Add details for your roommate meeting</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-date" className="text-right font-semibold text-slate-700">
                    Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newMeeting.date ? format(newMeeting.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
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
                  <Label htmlFor="meeting-time" className="text-right font-semibold text-slate-700">
                    Time
                  </Label>
                  <Input
                    id="meeting-time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="col-span-3 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-with" className="text-right font-semibold text-slate-700">
                    Meeting With
                  </Label>
                  <Input
                    id="meeting-with"
                    value={newMeeting.with}
                    onChange={(e) => setNewMeeting({ ...newMeeting, with: e.target.value })}
                    className="col-span-3 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                    placeholder="Enter name or email"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-location" className="text-right font-semibold text-slate-700">
                    Location Type
                  </Label>
                  <Select
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, location: value })}
                    defaultValue={newMeeting.location}
                  >
                    <SelectTrigger className="col-span-3 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                      <SelectItem value="Coffee Shop">☕ Coffee Shop</SelectItem>
                      <SelectItem value="Apartment Viewing">🏠 Apartment Viewing</SelectItem>
                      <SelectItem value="Video Call">📹 Video Call</SelectItem>
                      <SelectItem value="Restaurant">🍽️ Restaurant</SelectItem>
                      <SelectItem value="Other">📍 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-address" className="text-right font-semibold text-slate-700">
                    Address
                  </Label>
                  <Input
                    id="meeting-address"
                    value={newMeeting.address}
                    onChange={(e) => setNewMeeting({ ...newMeeting, address: e.target.value })}
                    className="col-span-3 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                    placeholder="Enter full address"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-notes" className="text-right font-semibold text-slate-700">
                    Notes
                  </Label>
                  <Textarea
                    id="meeting-notes"
                    value={newMeeting.notes}
                    onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                    className="col-span-3 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200" onClick={handleAddMeeting}>
                  Schedule Meeting
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 flex-1 overflow-auto">
          {/* Enhanced Calendar Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl" />
            </CardContent>
          </Card>

          <div className="space-y-6 overflow-auto">
            {/* Enhanced Daily Meetings Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">
                      {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      {filteredMeetings.length === 0
                        ? "No meetings scheduled for this day"
                        : `${filteredMeetings.length} meeting${filteredMeetings.length > 1 ? "s" : ""} scheduled`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-800">No Meetings</h3>
                    <p className="text-slate-600 max-w-sm">
                      You don't have any meetings scheduled for this day. Click "Add Meeting" to schedule one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMeetings.map((meeting) => (
                      <div key={meeting.id} className="border border-slate-200 rounded-xl p-6 space-y-4 bg-gradient-to-br from-slate-50 to-blue-50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                              <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-lg text-slate-800">Meeting with {meeting.with}</h3>
                          </div>
                          <div className="flex items-center text-slate-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="font-medium">{meeting.time}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-slate-600">
                          <MapPin className="h-4 w-4 mt-1 text-orange-500" />
                          <div>
                            <p className="font-semibold text-slate-800">{meeting.location}</p>
                            <p className="text-sm">{meeting.address}</p>
                          </div>
                        </div>
                        {meeting.notes && (
                          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
                            <p className="text-slate-700 text-sm">{meeting.notes}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <AddToCalendarButton 
                            event={convertMeetingToCalendarEvent(meeting)}
                            userEmail={userEmail}
                            variant="outline"
                            size="sm"
                            className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                          />
                          <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Upcoming Meetings Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Upcoming Meetings</CardTitle>
                    <CardDescription className="text-slate-600">Your next scheduled meetings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meetings
                    .filter((meeting) => meeting.date >= new Date())
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 3)
                    .map((meeting) => (
                      <div key={meeting.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:shadow-md transition-all duration-200">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold text-slate-800 truncate">{meeting.with}</p>
                            <p className="text-sm text-slate-600 font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full">
                              {format(meeting.date, "MMM d")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{meeting.location}</span>
                          </div>
                          <div className="mt-3">
                            <AddToCalendarButton 
                              event={convertMeetingToCalendarEvent(meeting)}
                              userEmail={userEmail}
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  {meetings.filter((meeting) => meeting.date >= new Date()).length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-600">No upcoming meetings scheduled</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

