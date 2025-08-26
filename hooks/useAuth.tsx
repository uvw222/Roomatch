"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  name: string
  userType: "renter" | "landlord"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      // Skip auth check if we're on login or register pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath === '/login' || currentPath === '/register') {
          setIsLoading(false)
          return
        }
      }

      const res = await fetch(`/api/profile/me`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.profile) {
          setUser({
            email: data.profile.email,
            name: data.profile.name,
            userType: data.profile.userType
          })
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setUser({
          email: data.user.email,
          name: data.user.name,
          userType: data.user.userType
        })
        return true
      } else {
        console.error('Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }, [])

  const register = useCallback(async (userData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setUser({
          email: data.user.email,
          name: data.user.name,
          userType: data.user.userType
        })
        return true
      } else {
        console.error('Registration failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`/api/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
