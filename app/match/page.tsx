"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Home, MessageCircle, X, RotateCcw, Info, ArrowLeft } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import Link from "next/link"

type Profile = {
  _id: string
  name: string
  age: number
  occupation: string
  location: string
  bio: string
  budget: number
  cleanliness: number
  interests: string[]
  profileImage: string
}

export default function MatchPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<string | null>(null)
  const [matches, setMatches] = useState<string[]>([])
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragRotation, setDragRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const currentProfile = profiles[currentIndex]
  const isMobile = useMobile()

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchMatches, 5000)
    return () => clearInterval(interval)
  }, [])

  // Reset flip state when profile changes
  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  const fetchAll = async () => {
    await fetchMatches()
    await fetchLikedMatches()
  }

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`)
      const data = await res.json()
      if (data.success) {
        setProfiles(data.matches)
        setCurrentIndex(0)
      } else {
        console.error("Failed to load matches")
      }
    } catch (err) {
      console.error("Error fetching matches:", err)
    }
  }

  const fetchLikedMatches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match/liked/full`)
      const data = await res.json()
      if (data.success) {
        setLikedProfiles(data.profiles)
        setMatches(data.profiles.map((p: any) => p._id))
      }
    } catch (err) {
      console.error("Failed to fetch liked profiles", err)
    }
  }

  // Enhanced drag handlers
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isAnimating || isFlipped) return
    setIsDragging(true)
    startPos.current = { x: clientX, y: clientY }
  }, [isAnimating, isFlipped])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || isAnimating || isFlipped) return
    
    const deltaX = clientX - startPos.current.x
    const deltaY = clientY - startPos.current.y
    const rotation = deltaX * 0.1 // Rotation based on horizontal movement
    
    setDragOffset({ x: deltaX, y: deltaY })
    setDragRotation(rotation)
  }, [isDragging, isAnimating, isFlipped])

  const handleDragEnd = useCallback(() => {
    if (!isDragging || isAnimating || isFlipped) return
    
    const threshold = 100 // Minimum distance to trigger swipe
    const { x } = dragOffset
    
    if (Math.abs(x) > threshold) {
      // Trigger swipe
      const swipeDirection = x > 0 ? "right" : "left"
      handleSwipe(swipeDirection)
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 })
      setDragRotation(0)
    }
    
    setIsDragging(false)
  }, [isDragging, isAnimating, dragOffset, isFlipped])

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDragging) return
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleDragEnd()
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }, [handleDragMove])

  const handleMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating || !currentProfile) return
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'j':
          e.preventDefault()
          if (!isFlipped) {
          handleSwipe('left')
          }
          break
        case 'ArrowRight':
        case 'k':
          e.preventDefault()
          if (!isFlipped) {
          handleSwipe('right')
          }
          break
        case 'ArrowUp':
        case 'u':
          e.preventDefault()
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
          }
          break
        case ' ':
        case 'Enter':
          e.preventDefault()
          setIsFlipped(!isFlipped)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isAnimating, currentProfile, currentIndex, isFlipped])

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentProfile || isAnimating || isFlipped) return
    
    setIsAnimating(true)
    setDirection(direction)
    setDragOffset({ x: 0, y: 0 })
    setDragRotation(0)

    const targetId = currentProfile._id
    const endpoint = direction === "right" ? `${process.env.NEXT_PUBLIC_API_URL}/api/match/like` : `${process.env.NEXT_PUBLIC_API_URL}/api/match/dislike`

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: targetId }),
      })

      const data = await response.json()

      if (direction === "right") {
        setMatches((prev) => [...prev, targetId])
        
        // Check if this created a mutual match
        if (data.success && data.isMatch && data.match) {
          // Trigger immediate match notification for the current user
          const event = new CustomEvent('showMatchNotification', {
            detail: {
              match: data.match
            }
          })
          window.dispatchEvent(event)
        }
      }
    } catch (error) {
      console.error("Error swiping:", error)
    }

    setTimeout(async () => {
      setDirection(null)
      setIsAnimating(false)
      const nextIndex = currentIndex + 1

      if (nextIndex >= profiles.length) {
        await fetchMatches()
      } else {
        setCurrentIndex(nextIndex)
      }
    }, 400)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="flex flex-col h-full pt-safe pb-safe bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
        <div className="w-full max-w-[95vw] sm:max-w-sm md:max-w-md mx-auto flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Find Your Match
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600 font-medium">Active Matching</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200 shadow-sm">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-slate-700">{matches.length} matches</span>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                💡 Swipe right to like, left to pass, or use ← → keys • Press Space/Enter to flip card
              </div>
            </div>
          </div>

          <div className="relative flex-1 w-full mb-20 min-h-[60vh] md:min-h-[70vh]">
            {/* Next card preview - shown behind current card */}
            {profiles[currentIndex + 1] && (
              <Card className="absolute inset-0 overflow-hidden transform scale-95 translate-y-2 bg-white/60 backdrop-blur-sm border-slate-200 shadow-lg">
                <div className="relative h-full w-full opacity-60">
                  <img
                    src={profiles[currentIndex + 1].profileImage || "/placeholder.svg"}
                    alt={profiles[currentIndex + 1].name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
              </Card>
            )}
            
            {/* Second card preview - shown behind next card */}
            {profiles[currentIndex + 2] && (
              <Card className="absolute inset-0 overflow-hidden transform scale-90 translate-y-4 bg-white/40 backdrop-blur-sm border-slate-100 shadow-md">
                <div className="relative h-full w-full opacity-30">
                  <img
                    src={profiles[currentIndex + 2].profileImage || "/placeholder.svg"}
                    alt={profiles[currentIndex + 2].name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                </div>
              </Card>
            )}
            
            {/* Current active card */}
            {currentProfile ? (
              <div
                ref={cardRef}
                className={`absolute inset-0 perspective-1000 ${
                  isDragging 
                    ? 'transition-none' 
                    : direction === "left"
                    ? "transition-all duration-400 ease-out translate-x-[-120%] rotate-[-25deg] opacity-0"
                    : direction === "right"
                    ? "transition-all duration-400 ease-out translate-x-[120%] rotate-[25deg] opacity-0"
                    : "transition-all duration-300 ease-out"
                }`}
                style={{
                  transform: isDragging 
                    ? `translate(${dragOffset.x}px, ${dragOffset.y * 0.5}px) rotate(${dragRotation}deg)`
                    : undefined,
                  opacity: isDragging && Math.abs(dragOffset.x) > 50 
                    ? Math.max(0.5, 1 - Math.abs(dragOffset.x) / 300)
                    : undefined,
                }}
              >
                <div 
                  className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front of card */}
                  <Card
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    className={`absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing select-none backface-hidden bg-white shadow-2xl border-0 rounded-2xl`}
              >
                <div className="relative h-full w-full">
                  {/* Base gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 rounded-2xl" />
                  
                  {/* Like overlay */}
                  {isDragging && dragOffset.x > 50 && (
                    <div 
                          className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 z-15 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      style={{ opacity: Math.min(1, dragOffset.x / 150) }}
                    >
                          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-2xl transform rotate-12 shadow-2xl">
                            <Heart className="h-10 w-10" />
                      </div>
                    </div>
                  )}
                  
                  {/* Dislike overlay */}
                  {isDragging && dragOffset.x < -50 && (
                    <div 
                          className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-pink-500/30 z-15 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      style={{ opacity: Math.min(1, Math.abs(dragOffset.x) / 150) }}
                    >
                          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-6 rounded-2xl transform -rotate-12 shadow-2xl">
                            <X className="h-10 w-10" />
                      </div>
                    </div>
                  )}
                  
                  <img
                    src={currentProfile.profileImage || "/placeholder.svg"}
                    alt={currentProfile.name}
                        className="h-full w-full object-cover rounded-2xl pointer-events-none"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h2 className="text-2xl font-bold mb-1">
                        {currentProfile.name}, {currentProfile.age}
                      </h2>
                            <p className="text-white/90 text-sm font-medium">{currentProfile.occupation}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                            <Home className="h-4 w-4" />
                            <span className="text-sm font-medium">{currentProfile.location}</span>
                      </div>
                    </div>
                        <p className="text-sm mb-4 line-clamp-2 leading-relaxed">{currentProfile.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 0 ? (
                            currentProfile.interests.slice(0, 3).map((interest, i) => (
                              <span key={i} className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 font-medium">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/60">No interests listed</span>
                      )}
                          {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 3 && (
                            <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 font-medium">
                              +{currentProfile.interests.length - 3} more
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <span className="opacity-90">Budget:</span> <span className="font-semibold">${currentProfile.budget}/mo</span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <span className="opacity-90">Cleanliness:</span> <span className="font-semibold">{currentProfile.cleanliness}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Back of card */}
                  <Card className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing select-none backface-hidden rotate-y-180 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 shadow-2xl rounded-2xl">
                    <div className="relative h-full w-full p-4 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3 sticky top-0 bg-gradient-to-br from-slate-50 to-blue-50 pt-2 pb-2 z-10">
                        <h2 className="text-lg font-bold text-slate-800">
                          {currentProfile.name}, {currentProfile.age}
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFlip}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all duration-200"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Profile Summary */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                              <img
                                src={currentProfile.profileImage || "/placeholder.svg"}
                                alt={currentProfile.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-sm">{currentProfile.name}</h3>
                              <p className="text-xs text-slate-600">{currentProfile.occupation}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Home className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-600">{currentProfile.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            About {currentProfile.name}
                          </h3>
                          <p className="text-xs text-slate-700 leading-relaxed">{currentProfile.bio}</p>
                        </div>

                        {/* Financial & Lifestyle */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Financial & Lifestyle
                          </h3>
                          <div className="space-y-2">
                      <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600">Monthly Budget</span>
                                <span className="font-medium text-slate-700">${currentProfile.budget.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, (currentProfile.budget / 3000) * 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {currentProfile.budget < 1000 ? "Budget-friendly" : 
                                 currentProfile.budget < 2000 ? "Moderate budget" : 
                                 currentProfile.budget < 3000 ? "Higher budget" : "Premium budget"}
                              </div>
                      </div>
                      <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600">Cleanliness Level</span>
                                <span className="font-medium text-slate-700">{currentProfile.cleanliness}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${currentProfile.cleanliness}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {currentProfile.cleanliness < 30 ? "Relaxed about cleanliness" : 
                                 currentProfile.cleanliness < 60 ? "Moderately clean" : 
                                 currentProfile.cleanliness < 80 ? "Very clean" : "Extremely clean"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compatibility Indicators */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Compatibility Factors
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                              <div className="text-xs font-medium text-green-800">Budget Match</div>
                              <div className="text-xs text-green-600">
                                {currentProfile.budget < 1500 ? "Likely compatible" : "May need discussion"}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                              <div className="text-xs font-medium text-blue-800">Cleanliness</div>
                              <div className="text-xs text-blue-600">
                                {currentProfile.cleanliness > 70 ? "High standards" : 
                                 currentProfile.cleanliness > 40 ? "Balanced" : "Relaxed"}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-2 border border-orange-200">
                              <div className="text-xs font-medium text-orange-800">Age Range</div>
                              <div className="text-xs text-orange-600">
                                {currentProfile.age < 25 ? "Young professional" : 
                                 currentProfile.age < 35 ? "Established career" : "Experienced"}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
                              <div className="text-xs font-medium text-purple-800">Lifestyle</div>
                              <div className="text-xs text-purple-600">
                                {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 3 ? "Active & diverse" : "Focused interests"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Interests */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            Interests & Hobbies ({Array.isArray(currentProfile.interests) ? currentProfile.interests.length : 0})
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 0 ? (
                              currentProfile.interests.map((interest, i) => (
                                <span key={i} className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200">
                                  {interest}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">No interests listed yet</span>
                            )}
                          </div>
                          {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600">
                              <span className="font-medium">Categories:</span> {
                                currentProfile.interests.length > 3 ? 
                                `${Math.ceil(currentProfile.interests.length / 3)} different areas` : 
                                "Focused interests"
                              }
                            </div>
                          )}
                        </div>

                        {/* Living Preferences */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                            Living Preferences
                          </h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Budget Range:</span>
                              <span className="font-medium text-slate-700">${Math.floor(currentProfile.budget * 0.8).toLocaleString()} - ${Math.ceil(currentProfile.budget * 1.2).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Cleanliness Expectation:</span>
                              <span className="font-medium text-slate-700">
                                {currentProfile.cleanliness < 30 ? "Casual" : 
                                 currentProfile.cleanliness < 60 ? "Moderate" : 
                                 currentProfile.cleanliness < 80 ? "High" : "Very High"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Location:</span>
                              <span className="font-medium text-slate-700">{currentProfile.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Profile Completeness:</span>
                              <span className="font-medium text-slate-700">
                                {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 0 && currentProfile.bio ? "Complete" : "Basic"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
                          <h3 className="font-semibold text-slate-800 mb-2 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                            Quick Stats
                          </h3>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
                              <div className="text-lg font-bold text-blue-700">{currentProfile.age}</div>
                              <div className="text-xs text-blue-600">Age</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
                              <div className="text-lg font-bold text-green-700">${(currentProfile.budget / 1000).toFixed(1)}k</div>
                              <div className="text-xs text-green-600">Budget</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200">
                              <div className="text-lg font-bold text-purple-700">{currentProfile.cleanliness}%</div>
                              <div className="text-xs text-purple-600">Clean</div>
                            </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 mt-10">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">🎉 You've viewed all available matches!</h3>
                  <p className="text-slate-600">Come back later for more potential roommates.</p>
                </div>
              </div>
            )}

            {currentProfile && (
              <div className="absolute bottom-[-40px] left-0 right-0 flex justify-center gap-6 z-30">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isAnimating || isFlipped}
                  className="h-16 w-16 rounded-full bg-white shadow-xl border-2 border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 disabled:opacity-50 transition-all duration-200 hover:scale-110"
                  onClick={() => handleSwipe("left")}
                >
                  <X className="h-7 w-7" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentIndex === 0 || isAnimating}
                  className="h-12 w-12 rounded-full bg-white shadow-lg border-2 border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-400 disabled:opacity-30 transition-all duration-200 hover:scale-110"
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1)
                    }
                  }}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isAnimating}
                  className="h-12 w-12 rounded-full bg-white shadow-lg border-2 border-blue-300 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition-all duration-200 hover:scale-110"
                  onClick={handleFlip}
                >
                  <Info className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isAnimating || isFlipped}
                  className="h-16 w-16 rounded-full bg-white shadow-xl border-2 border-green-400 text-green-500 hover:bg-green-50 hover:text-green-600 hover:border-green-500 disabled:opacity-50 transition-all duration-200 hover:scale-110"
                  onClick={() => handleSwipe("right")}
                >
                  <Heart className="h-7 w-7" />
                </Button>
              </div>
            )}
          </div>

         
        </div>
      </div>
    </div>
  )
}
