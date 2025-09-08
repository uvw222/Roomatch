"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Calendar, User, Home, Heart, TrendingUp, Users, Clock, ArrowRight, Plus, Edit3, MapPin } from "lucide-react"
import Link from "next/link"
import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { useAuth } from "@/hooks/useAuth"
import { useProfile } from "@/hooks/useProfile"
import { format } from "date-fns"

type Meeting = {
  _id: string
  requesterEmail: string
  participantEmail: string
  requesterName: string
  participantName: string
  title?: string
  description?: string
  notes?: string
  date: Date
  time: string
  duration?: number
  locationType: string
  address?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  requesterConfirmed: boolean
  participantConfirmed: boolean
  createdAt: Date
  updatedAt: Date
}

type Match = {
  _id: string
  email: string
  name: string
  age?: number
  userType: string
  profileImage?: string
  location?: string
  bio?: string
  occupation?: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount?: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile()
  const { unreadCount } = useUnreadMessages()
  const [matchCount, setMatchCount] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(true)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true)

  // Fetch actual mutual matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoadingMatches(true)
        // Use the chat/matches API to get full match data with message info
        const res = await fetch('/api/chat/matches', {
          credentials: 'include'
        })
        const data = await res.json()
        
        if (data.success) {
          setMatches(data.matches || [])
          setMatchCount(data.matches?.length || 0)
        } else {
          console.error('Failed to fetch matches:', data.error)
          setMatches([])
          setMatchCount(0)
        }
      } catch (error) {
        console.error('Error fetching matches:', error)
        setMatches([])
        setMatchCount(0)
      } finally {
        setIsLoadingMatches(false)
      }
    }

    if (user && profile) {
      fetchMatches()
    }
  }, [user, profile])

  // Fetch meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoadingMeetings(true)
        const res = await fetch('/api/meetings', {
          credentials: 'include'
        })
        
        if (res.status === 401) {
          return // Not authenticated
        }
        
        const data = await res.json()
        
        if (data.success) {
          // Convert date strings to Date objects
          const meetingsWithDates = data.meetings.map((meeting: any) => ({
            ...meeting,
            date: new Date(meeting.date),
            createdAt: new Date(meeting.createdAt),
            updatedAt: new Date(meeting.updatedAt)
          }))
          setMeetings(meetingsWithDates)
        } else {
          console.error('Failed to fetch meetings:', data.error)
          setMeetings([])
        }
      } catch (error) {
        console.error('Error fetching meetings:', error)
        setMeetings([])
      } finally {
        setIsLoadingMeetings(false)
      }
    }

    if (user) {
      fetchMeetings()
    }
  }, [user])

  // Get upcoming meetings (confirmed and pending requests for user)
  const upcomingMeetings = meetings.filter(meeting => {
    const now = new Date()
    const meetingDate = new Date(meeting.date)
    return meetingDate >= now && (meeting.status === 'confirmed' || 
      (meeting.status === 'pending' && meeting.participantEmail === user?.email))
  }).slice(0, 3) // Show only 3 most recent

  // Helper function to get other participant name
  const getOtherParticipantName = (meeting: Meeting) => {
    return meeting.requesterEmail === user?.email 
      ? meeting.participantName 
      : meeting.requesterName
  }

  if (profileLoading || !profile) {
    return (
      <div className="page-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-12">
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          {/* Enhanced Header */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">
                  Welcome back, {profile.name}! 👋
                </h1>
                <p className="text-slate-600 text-sm sm:text-base md:text-lg">Here's what's happening with your roommate search</p>
              </div>
              <div className="flex sm:hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-200 shadow-sm self-start">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-slate-700">Active</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Profile Views</CardTitle>
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{profile.views ?? 0}</div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  +12% this week
                </p>
              </CardContent>
            </Card>

            <Link href="/matches">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Matches</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{matchCount}</div>
                  <p className="text-xs text-slate-500">mutual connections</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/chat">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Messages</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{unreadCount}</div>
                  <p className="text-xs text-slate-500">
                    {unreadCount === 1 ? 'unread message' : 'unread messages'}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/likes">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3 space-y-0 px-3 sm:px-6 pt-3 sm:pt-6">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-slate-700">Likes</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{profile.likedProfiles?.length || 0}</div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="hidden sm:inline">People you've liked</span>
                    <span className="sm:hidden">Your likes</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Enhanced Main Content */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Recent Matches</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-600">People you've matched with recently</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  {isLoadingMatches ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-slate-600">Loading matches...</p>
                    </div>
                  ) : matchCount === 0 ? (
                    <div className="text-center py-8 sm:py-12 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">No matches yet</h3>
                      <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4 px-2">Start swiping to find your perfect roommate</p>
                      <Link href="/match">
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                          <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Start Matching
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matches.slice(0, 3).map((match) => (
                        <div key={match._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            {match.profileImage ? (
                              <img 
                                src={match.profileImage} 
                                alt={match.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <User className="h-6 w-6 text-orange-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-800 truncate">{match.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {match.userType === 'renter' ? '🏠 Renter' : '🏢 Landlord'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              {match.age && <span>Age {match.age}</span>}
                              {match.age && match.location && <span>•</span>}
                              {match.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{match.location}</span>
                                </div>
                              )}
                            </div>
                            {match.lastMessage && (
                              <p className="text-xs text-slate-500 truncate mt-1">
                                Last: {match.lastMessage}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {match.unreadCount && match.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {match.unreadCount}
                              </Badge>
                            )}
                            <Link href={`/chat?other=${match.email}`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {matchCount > 3 && (
                        <div className="text-center pt-2">
                          <Link href="/matches">
                            <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                              View All {matchCount} Matches
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                      
                      {matchCount <= 3 && matchCount > 0 && (
                        <div className="text-center pt-2">
                          <Link href="/matches">
                            <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                              View All Matches
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Upcoming Meetings</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-600 hidden sm:block">Your scheduled roommate meetings</CardDescription>
                    <CardDescription className="text-xs text-slate-600 sm:hidden">Scheduled meetings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  {isLoadingMeetings ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-xs text-slate-500 mt-2">Loading meetings...</p>
                    </div>
                  ) : upcomingMeetings.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 border-2 border-dashed border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <p className="text-sm sm:text-base text-slate-600 mb-2 sm:mb-3">No meetings scheduled</p>
                      <p className="text-xs sm:text-sm text-slate-500 px-2">Schedule meetings with your matches</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMeetings.map((meeting) => (
                        <div key={meeting._id} className="p-3 border border-slate-200 rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <h4 className="font-semibold text-sm text-slate-800">{getOtherParticipantName(meeting)}</h4>
                              <Badge variant={meeting.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                {meeting.status === 'pending' ? 'Request' : 'Confirmed'}
                              </Badge>
                            </div>
                            <span className="text-xs text-slate-500">{format(meeting.date, 'MMM d')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="h-3 w-3" />
                            <span>{meeting.time}</span>
                            <MapPin className="h-3 w-3 ml-1" />
                            <span className="truncate">{meeting.locationType}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link href="/calendar">
                    <Button size="sm" variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {upcomingMeetings.length === 0 ? 'Schedule Meeting' : 'View Calendar'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Find More Matches</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-600 hidden sm:block">Continue your search for the perfect roommate</CardDescription>
                    <CardDescription className="text-xs text-slate-600 sm:hidden">Continue searching</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center py-4 sm:py-6 px-4 sm:px-6">
                <Link href="/match">
                  <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Start Matching
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Complete Your Profile</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-slate-600 hidden sm:block">A complete profile gets 75% more matches</CardDescription>
                    <CardDescription className="text-xs text-slate-600 sm:hidden">Get 75% more matches</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-600">Profile Completion</span>
                      <span className="font-semibold text-slate-800">70%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-3 rounded-full transition-all duration-300" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">Add more details to increase your match rate</p>
                  <Link href="/profile/edit">
                    <Button size="sm" variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
