"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface Profile {
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
  views?: number
  likedProfiles?: string[]
}

interface ProfileContextType {
  profile: Profile | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`)
      const data = await res.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
      }
    } catch (err) {
      console.error("Failed to load profile", err)
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
    clearProfile
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
