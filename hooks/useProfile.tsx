"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface Profile {
  _id: string
  name: string
  age: number
  occupation: string
  location: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  bio: string
  profileImage?: string
  email?: string
  userType: "renter" | "landlord"
  views?: number
  likedProfiles?: string[]
  dislikedProfiles?: string[]
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
  budget?: number
  moveInDate?: string
  hasPets?: boolean
  isSmoker?: boolean
  createdAt?: Date
}

interface ProfileContextType {
  profile: Profile | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
  clearProfile: () => void
  userType: "renter" | "landlord" | null
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      // Skip profile fetch if we're on login or register pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath === '/login' || currentPath === '/register') {
          setIsLoading(false)
          return
        }
      }

      setIsLoading(true)
      const res = await fetch(`/api/profile/me`, {
        credentials: 'include' // Include cookies for authentication
      })
      
      if (res.status === 401) {
        // User is not authenticated, clear profile but don't redirect
        setProfile(null)
        return
      }
      
      const data = await res.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error("Failed to load profile", err)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const clearProfile = useCallback(() => {
    setProfile(null)
  }, [])

  const value: ProfileContextType = {
    profile,
    isLoading,
    refreshProfile: fetchProfile,
    clearProfile,
    userType: profile?.userType || null
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

// Backward compatibility hook
export function useProfileImage() {
  const { profile, isLoading, refreshProfile } = useProfile()
  
  return {
    profileImage: profile?.profileImage || "",
    isLoading,
    refreshProfileImage: refreshProfile
  }
}
