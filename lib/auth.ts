import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getCollection } from "./db"

export interface UserSession {
  email: string
  userId: string
  userType: "renter" | "landlord"
  name: string
}

export interface JWTPayload {
  email: string
  userId: string
  userType: "renter" | "landlord"
  name: string
  iat: number
  exp: number
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const TOKEN_EXPIRY = "7d" // 7 days

/**
 * Generate JWT token for user
 */
export function generateToken(userData: Omit<UserSession, "iat" | "exp">): string {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

/**
 * Get current user from request (server-side)
 */
export async function getCurrentUser(req?: NextRequest): Promise<UserSession | null> {
  try {
    // Try to get token from Authorization header first
    let token: string | undefined
    
    if (req) {
      const authHeader = req.headers.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }
    
    // If no token in header, try to get from cookies
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get("auth_token")?.value
    }
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
    // Verify user still exists in database
    const profiles = await getCollection("profiles")
    const user = await profiles.findOne({ email: payload.email })
    
    if (!user) {
      return null
    }
    
    return {
      email: payload.email,
      userId: payload.userId,
      userType: payload.userType,
      name: payload.name
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Set authentication cookies
 */
export function setAuthCookies(response: NextResponse, userData: UserSession): NextResponse {
  const token = generateToken(userData)
  
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
  
  // Also set user_email for backward compatibility
  response.cookies.set("user_email", userData.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
  
  return response
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
  
  response.cookies.set("user_email", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  })
  
  return response
}

/**
 * Require authentication middleware
 */
export async function requireAuth(req?: NextRequest): Promise<UserSession> {
  const user = await getCurrentUser(req)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Get user type for filtering
 */
export function getOppositeUserType(userType: "renter" | "landlord"): "renter" | "landlord" {
  return userType === "renter" ? "landlord" : "renter"
}
