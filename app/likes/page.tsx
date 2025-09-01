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
  email?: string
}

export default function LikesPage() {
  const { profile } = useProfile()
  const [likedProfiles, setLikedProfiles] = useState<LikedProfile[]>([])
  const [mutualMatches, setMutualMatches] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchLikedProfiles()
    fetchMutualMatches()
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

  const fetchMutualMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/mutual`)
      const data = await res.json()
      if (data.success) {
        // Create a set of mutual match IDs for quick lookup
        const mutualIds = new Set(data.matches.map((match: any) => match._id))
        setMutualMatches(mutualIds)
      }
    } catch (err) {
      console.error("Failed to fetch mutual matches", err)
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
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/match">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-white/80 transition-all duration-200 group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Matches
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Your Likes
              </h1>
              <p className="text-slate-600 text-lg">People you've shown interest in</p>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Heart className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-slate-700">{likedProfiles.length} liked</span>
            </div>
          </div>

          {likedProfiles.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="text-center py-16 px-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">No Likes Yet</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Start swiping right on profiles you're interested in to see them here.
                  </p>
                  <Link href="/match">
                    <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                      <Users className="h-5 w-5 mr-2" />
                      Start Matching
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {likedProfiles.map((profile) => {
                const isFlipped = flippedCards.has(profile._id)
                const isMutualMatch = mutualMatches.has(profile._id)
                return (
                  <div key={profile._id} className="relative group perspective">
                    {/* Flip Card Container */}
                    <div 
                      className={`relative w-full h-[420px] transition-transform duration-500 transform-style-preserve-3d cursor-pointer ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                      onClick={() => toggleCardFlip(profile._id)}
                    >
                      {/* Front of Card */}
                      <div className="absolute inset-0 w-full h-full backface-hidden">
                        <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg group-hover:scale-[1.02]">
                          <div className="relative h-full">
                            <img
                              src={profile.profileImage || "/placeholder.svg"}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            {/* Remove Button */}
                            <div className="absolute top-4 right-4">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-10 w-10 p-0 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 shadow-lg transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveLike(profile._id)
                                }}
                                disabled={removingId === profile._id}
                              >
                                {removingId === profile._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </Button>
                            </div>

                            {/* Profile Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold text-2xl mb-1">{profile.name}</h3>
                                  <p className="text-white/90 text-lg">{profile.age} years old</p>
                                </div>
                                <div className="text-xs bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                                  {profile.userType === 'renter' ? 'Looking' : 'Available'}
                                </div>
                              </div>
                              
                              <p className="text-white/95 text-base font-medium mb-4">{profile.occupation}</p>
                              
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                                  <p className="text-sm text-white/80 font-medium">Click to see more details</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Back of Card */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                        <Card className="h-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-lg">
                          <CardContent className="p-6 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-xl text-slate-800 mb-1">{profile.name}</h3>
                                <p className="text-slate-600 text-base">{profile.age} years old</p>
                              </div>
                              <div className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-2 rounded-full font-medium border border-orange-200">
                                {profile.userType === 'renter' ? 'Looking' : 'Available'}
                              </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Briefcase className="h-4 w-4" />
                                <span>{profile.occupation}</span>
                              </div>
                              
                              {profile.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{profile.location}</span>
                                </div>
                              )}

                              {profile.budget && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <span className="font-medium">${profile.budget}/month</span>
                                </div>
                              )}
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                              <div className="mb-4">
                                <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">
                                  {profile.bio}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-auto">
                              <Link href={`/profile/${profile._id}`} className="flex-1">
                                <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
                                  <Users className="h-4 w-4 mr-2" />
                                  View Full Profile
                                </Button>
                              </Link>
                            </div>

                            {/* Flip Back Hint */}
                            <div className="text-center mt-2">
                              <p className="text-xs text-slate-500">Click to flip back</p>
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
    </div>
  )
}
