"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Home, MessageCircle, X } from "lucide-react"
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
  const cardRef = useRef<HTMLDivElement>(null)
  const currentProfile = profiles[currentIndex]
  const isMobile = useMobile()

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchMatches, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAll = async () => {
    await fetchMatches()
    await fetchLikedMatches()
  }

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches")
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
      const res = await fetch("/api/match/liked/full")
      const data = await res.json()
      if (data.success) {
        setLikedProfiles(data.profiles)
        setMatches(data.profiles.map((p: any) => p._id))
      }
    } catch (err) {
      console.error("Failed to fetch liked profiles", err)
    }
  }

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentProfile) return
    setDirection(direction)

    const targetId = currentProfile._id
    const endpoint = direction === "right" ? "/api/match/like" : "/api/match/dislike"

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId: targetId }),
    })

    if (direction === "right") {
      setMatches((prev) => [...prev, targetId])
    }

    setTimeout(async () => {
      setDirection(null)
      const nextIndex = currentIndex + 1

      if (nextIndex >= profiles.length) {
        await fetchMatches()
      } else {
        setCurrentIndex(nextIndex)
      }
    }, 300)
  }

  return (
    <div className="flex flex-col h-full pt-safe pb-safe">
      <div className="container px-4 py-4 flex-1 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Find Your Match</h1>
          </div>

          <div className="relative flex-1 w-full mb-16">
            {currentProfile ? (
              <Card
                ref={cardRef}
                className={`absolute inset-0 overflow-hidden transition-all duration-300 ${
                  direction === "left"
                    ? "translate-x-[-120%] rotate-[-20deg]"
                    : direction === "right"
                    ? "translate-x-[120%] rotate-[20deg]"
                    : ""
                }`}
              >
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-10 rounded-lg" />
                  <img
                    src={currentProfile.profileImage || "/placeholder.svg"}
                    alt={currentProfile.name}
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold">
                        {currentProfile.name}, {currentProfile.age}
                      </h2>
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                        <Home className="h-3 w-3" />
                        <span className="text-xs">{currentProfile.location}</span>
                      </div>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{currentProfile.occupation}</p>
                    <p className="text-sm mb-4">{currentProfile.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(currentProfile.interests) && currentProfile.interests.length > 0 ? (
                        currentProfile.interests.map((interest, i) => (
                          <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/60">No interests listed</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="opacity-80">Budget:</span> ${currentProfile.budget}/mo
                      </div>
                      <div>
                        <span className="opacity-80">Cleanliness:</span> {currentProfile.cleanliness}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center text-gray-500 mt-10">
                🎉 You've viewed all available matches. Come back later!
              </div>
            )}

            {currentProfile && (
              <div className="absolute bottom-[-30px] left-0 right-0 flex justify-center gap-4 z-30">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white shadow-lg border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleSwipe("left")}
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white shadow-lg border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                  onClick={() => handleSwipe("right")}
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>

          <div className="mt-16 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Your Matches ({matches.length})</h2>
            {matches.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No matches yet</p>
                <p className="text-sm text-gray-400">Swipe right on profiles you're interested in</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {likedProfiles.map((profile) => (
                  <Link key={profile._id} href={`/profile/${profile._id}`}>
                    <div className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition">
                      <div className="relative h-32">
                        <img
                          src={profile.profileImage || "/placeholder.svg"}
                          alt={profile.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium">{profile.name}, {profile.age}</h3>
                        <p className="text-sm text-gray-500 truncate">{profile.occupation}</p>
                        <p className="text-xs text-orange-600 mt-1">View profile →</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
