"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowLeft, Users, MessageCircle, Trash2, MapPin, Briefcase } from "lucide-react"
import Link from "next/link"
import { useProfile } from "../../hooks/useProfile"

type LikedProfile = {
  _id: string
  name: string
  age: number
  occupation: string
  location: string
  bio: string
  profileImage: string
  userType: string
  budget?: number
  moveInDate?: string
  hasPets?: boolean
  isSmoker?: boolean
  lifestyle?: {
    cleanliness: number
    noise: number
    guestsFrequency: number
    sleepSchedule: string
  }
  views?: number
}

export default function LikesPage() {
  const { profile } = useProfile()
  const [likedProfiles, setLikedProfiles] = useState<LikedProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLikedProfiles()
  }, [])

  const fetchLikedProfiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match/liked/full`)
      const data = await res.json()
      if (data.success) {
        setLikedProfiles(data.profiles)
      }
    } catch (err) {
      console.error("Failed to fetch liked profiles", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveLike = async (profileId: string) => {
    setRemovingId(profileId)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: profileId }),
      })

      if (res.ok) {
        // Remove from local state
        setLikedProfiles(prev => prev.filter(p => p._id !== profileId))
        // Remove from flipped cards
        setFlippedCards(prev => {
          const newSet = new Set(prev)
          newSet.delete(profileId)
          return newSet
        })
      }
    } catch (err) {
      console.error("Failed to remove like", err)
    } finally {
      setRemovingId(null)
    }
  }

  const toggleCardFlip = (profileId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(profileId)) {
        newSet.delete(profileId)
      } else {
        newSet.add(profileId)
      }
      return newSet
    })
  }



  if (isLoading) {
    return (
      <div className="container py-10 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading your likes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/match">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Matches
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Likes</h1>
            <p className="text-gray-600">People you've shown interest in</p>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Heart className="h-5 w-5" />
            <span className="font-medium">{likedProfiles.length} liked</span>
          </div>
        </div>

        {likedProfiles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Likes Yet</h3>
              <p className="text-gray-500 mb-6">
                Start swiping right on profiles you're interested in to see them here.
              </p>
              <Link href="/match">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Users className="h-4 w-4 mr-2" />
                  Start Matching
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {likedProfiles.map((profile) => {
              const isFlipped = flippedCards.has(profile._id)
              return (
                <div key={profile._id} className="relative group perspective">
                  {/* Flip Card Container */}
                  <div 
                    className={`relative w-full h-96 transition-transform duration-500 transform-style-preserve-3d cursor-pointer ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => toggleCardFlip(profile._id)}
                  >
                    {/* Front of Card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-full">
                          <img
                            src={profile.profileImage || "/placeholder.svg"}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          
                          {/* Remove Button */}
                          <div className="absolute top-3 right-3">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveLike(profile._id)
                              }}
                              disabled={removingId === profile._id}
                            >
                              {removingId === profile._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {/* Profile Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-xl">{profile.name}</h3>
                                <p className="text-white/80">{profile.age} years old</p>
                              </div>
                              <div className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                                {profile.userType === 'renter' ? 'Looking' : 'Available'}
                              </div>
                            </div>
                            
                            <p className="text-white/90 text-sm mb-2">{profile.occupation}</p>
                            
                            <div className="mt-3 text-center">
                              <p className="text-xs text-white/60">Click to see more details</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Back of Card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                      <Card className="h-full overflow-hidden">
                        <CardContent className="p-4 h-full flex flex-col">
                          {/* Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{profile.name}</h3>
                              <p className="text-gray-600 text-sm">{profile.age} years old</p>
                            </div>
                            <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              {profile.userType === 'renter' ? 'Looking' : 'Available'}
                            </div>
                          </div>

                          {/* Basic Info */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="h-4 w-4" />
                              <span>{profile.occupation}</span>
                            </div>
                            
                            {profile.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{profile.location}</span>
                              </div>
                            )}

                            {profile.budget && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">${profile.budget}/month</span>
                              </div>
                            )}
                          </div>

                          {/* Bio */}
                          {profile.bio && (
                            <div className="mb-4">
                              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                                {profile.bio}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-auto">
                            <Link href={`/profile/${profile._id}`} className="flex-1">
                              <Button variant="outline" className="w-full" onClick={(e) => e.stopPropagation()}>
                                <Users className="h-4 w-4 mr-2" />
                                View Full Profile
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="px-3" onClick={(e) => e.stopPropagation()}>
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Flip Back Hint */}
                          <div className="text-center mt-2">
                            <p className="text-xs text-gray-500">Click to flip back</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
