"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"
import SmartMap from "@/components/SmartMap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  User, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Home, 
  Heart, 
  MessageCircle, 
  Eye,
  Star,
  Users,
  Clock,
  Building,
  Wifi,
  Car,
  Dog,
  Cat,
  Music,
  BookOpen,
  Coffee,
  Utensils,
  Gamepad2,
  Dumbbell,
  Palette,
  Camera,
  Plane,
  TreePine,
  Sun,
  Moon,
  Trash2
} from "lucide-react"
import Link from "next/link"

type ProfileType = {
  _id: string
  name: string
  age: number
  bio: string
  profileImage: string
  occupation: string
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  budget: number
  views: number
  userType: string
  moveInDate?: string
  hasPets?: boolean
  isSmoker?: boolean
  lifestyle?: {
    cleanliness: number
    noise: number
    guestsFrequency: number
    sleepSchedule: string
  }
  preferences?: {
    ageRange: number[]
    genderPreference: string
    petsAllowed: boolean
    smokingAllowed: boolean
  }
}

export default function ProfilePage(props: { params: { id: string } }) {
  const { id } = props.params;
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    fetchProfile()
    checkLikeStatus()
  }, [id])

  const fetchProfile = async () => {
    try {
      // Increment views
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${id}/view`, {
        method: "POST"
      })
      
      // Fetch profile data
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${id}`)
      const data = await res.json()
      
      if (data.success) {
        setProfile(data.profile)
      } else {
        notFound()
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      notFound()
    } finally {
      setIsLoading(false)
    }
  }

  const checkLikeStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match/liked`)
      const data = await res.json()
      
      if (data.success) {
        setIsLiked(data.likedProfiles.includes(id))
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const handleLikeAction = async () => {
    if (isLiked) {
      // Remove from likes
      setIsRemoving(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match/dislike`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetProfileId: id }),
        })
        
        if (res.ok) {
          setIsLiked(false)
        }
      } catch (error) {
        console.error("Error removing like:", error)
      } finally {
        setIsRemoving(false)
      }
    } else {
      // Add to likes
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetProfileId: id }),
        })
        
        if (res.ok) {
          setIsLiked(true)
        }
      } catch (error) {
        console.error("Error adding like:", error)
      }
    }
  }

  // Helper function to get sleep schedule icon
  const getSleepIcon = (schedule: string) => {
    switch (schedule) {
      case 'early': return <Sun className="h-4 w-4" />
      case 'late': return <Moon className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Helper function to get user type badge
  const getUserTypeBadge = (userType: string) => {
    return userType === 'renter' ? 
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Looking for Room</Badge> :
      <Badge variant="secondary" className="bg-green-100 text-green-800">Has Room Available</Badge>
  }

  if (isLoading) {
    return (
      <div className="container py-10 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return notFound()
  }

  return (
    <div className="container py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/match">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Back to Matches
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Image & Basic Info */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <img
                    src={profile.profileImage || "/placeholder.svg"}
                    alt={profile.name}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4">
                    {getUserTypeBadge(profile.userType)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{profile.age} years old</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.occupation}</span>
                    </div>
                    
                    {profile.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}

                    {profile.budget > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>Budget: ${profile.budget}/month</span>
                      </div>
                    )}

                    {profile.moveInDate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Home className="h-4 w-4" />
                        <span>Move-in: {profile.moveInDate}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      className={`flex-1 ${isLiked ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                      onClick={handleLikeAction}
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : isLiked ? (
                        <Trash2 className="h-4 w-4 mr-2" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      {isLiked ? 'Remove from Likes' : 'Pass'}
                    </Button>
                    {!isLiked && (
                      <Button 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={handleLikeAction}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Like
                      </Button>
                    )}
                  </div>

                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-6">
            {/* About Me */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {profile.bio || "No bio available"}
                </p>
              </CardContent>
            </Card>

            {/* Lifestyle Preferences */}
            {profile.lifestyle && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Lifestyle & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cleanliness</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${profile.lifestyle.cleanliness}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{profile.lifestyle.cleanliness}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Noise Level</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${profile.lifestyle.noise}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{profile.lifestyle.noise}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Guests Frequency</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${profile.lifestyle.guestsFrequency}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{profile.lifestyle.guestsFrequency}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getSleepIcon(profile.lifestyle.sleepSchedule)}
                        <span className="text-sm text-gray-600">
                          Sleep Schedule: {profile.lifestyle.sleepSchedule}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {profile.hasPets ? <Dog className="h-4 w-4 text-green-600" /> : <Dog className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm text-gray-600">
                          Pets: {profile.hasPets ? 'Yes' : 'No'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {profile.isSmoker ? <span className="text-red-600">🚬</span> : <span className="text-green-600">✅</span>}
                        <span className="text-sm text-gray-600">
                          Smoking: {profile.isSmoker ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {profile.coordinates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{profile.location}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      Coordinates: {profile.coordinates.latitude.toFixed(4)}, {profile.coordinates.longitude.toFixed(4)}
                    </div>
                    <SmartMap 
                      latitude={profile.coordinates.latitude}
                      longitude={profile.coordinates.longitude}
                      height="300px"
                      className="rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Profile Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {profile.views || 0}
                    </div>
                    <div className="text-sm text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {profile.userType === 'renter' ? 'Looking' : 'Available'}
                    </div>
                    <div className="text-sm text-gray-600">Room Status</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
