"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star,
  ArrowRight,
  Search
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'


interface Match {
  _id: string
  name: string
  age?: number
  occupation?: string
  location?: string
  bio?: string
  budget?: number
  profileImage?: string
  userType: "renter" | "landlord"
  hasPets?: boolean
  isSmoker?: boolean
  lifestyle?: {
    cleanliness: number
    noise: number
    guestsFrequency: number
    sleepSchedule: string
  }
  moveInDate?: string
  email: string
  createdAt: string
}

export default function MatchesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')



  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchMatches()
  }, [user, router])

  const fetchMatches = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/matches/mutual', {
        credentials: 'include'
      })
      const data = await res.json()
      
      if (data.success) {
        setMatches(data.matches)
      } else {
        console.error('Failed to fetch matches:', data.error)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMatches = matches.filter(match => {
    return match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           match.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           match.location?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleViewProfile = (email: string) => {
    // Navigate to profile page
    router.push(`/profile/${email}`)
  }

  const handleStartChat = (email: string) => {
    // Navigate to chat page
    router.push(`/chat?other=${encodeURIComponent(email)}`)
  }



  const getLifestyleScore = (lifestyle: any) => {
    if (!lifestyle) return 0
    const { cleanliness, noise, guestsFrequency } = lifestyle
    return Math.round((cleanliness + (100 - noise) + (100 - guestsFrequency)) / 3)
  }

  const getCompatibilityBadge = (lifestyle: any) => {
    const score = getLifestyleScore(lifestyle)
    if (score >= 80) return { text: 'High Compatibility', color: 'bg-green-100 text-green-800' }
    if (score >= 60) return { text: 'Good Compatibility', color: 'bg-blue-100 text-blue-800' }
    return { text: 'Fair Compatibility', color: 'bg-yellow-100 text-yellow-800' }
  }

  if (isLoading) {
    return (
      <div className="page-content bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-safe pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your matches...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-safe pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Your Matches
              </h1>
              <p className="text-slate-600 text-lg mt-2">
                {filteredMatches.length} mutual connection{filteredMatches.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                <Heart className="h-3 w-3 mr-1" />
                {matches.length} Total
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, occupation, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No matches found</h3>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search'
                  : 'Start swiping to find your perfect roommate match!'
                }
              </p>
              <Button 
                onClick={() => router.push('/match')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Heart className="h-4 w-4 mr-2" />
                Start Matching
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => (
              <Card key={match._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-orange-200">
                        <AvatarImage src={match.profileImage} alt={match.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600">
                          {match.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                          {match.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {match.userType}
                          </Badge>
                          {match.age && (
                            <span className="text-sm text-slate-600">{match.age} years</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    {match.occupation && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4" />
                        <span>{match.occupation}</span>
                      </div>
                    )}
                    {match.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{match.location}</span>
                      </div>
                    )}
                    {match.budget && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <DollarSign className="h-4 w-4" />
                        <span>${match.budget}/month</span>
                      </div>
                    )}
                    {match.moveInDate && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>Move-in: {new Date(match.moveInDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {match.bio && (
                    <p className="text-sm text-slate-700 line-clamp-3">{match.bio}</p>
                  )}

                  {/* Lifestyle Compatibility */}
                  {match.lifestyle && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Lifestyle Compatibility</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-orange-500 fill-current" />
                          <span className="text-sm font-medium">{getLifestyleScore(match.lifestyle)}%</span>
                        </div>
                      </div>
                      <Badge className={getCompatibilityBadge(match.lifestyle).color}>
                        {getCompatibilityBadge(match.lifestyle).text}
                      </Badge>
                    </div>
                  )}

                  {/* Preferences */}
                  <div className="flex flex-wrap gap-2">
                    {match.hasPets && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Has Pets
                      </Badge>
                    )}
                    {match.isSmoker && (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Smoker
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(match.email)}
                      className="flex-1 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Profile
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(match.email)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}
