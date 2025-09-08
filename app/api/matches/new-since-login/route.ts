import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import mongoose from 'mongoose'

export async function GET() {
  try {
    const user = await requireAuth()

    const profiles = await getCollection("profiles")
    const currentUser = await profiles.findOne({ email: user.email })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const myIdString = currentUser._id.toString()
    const likedObjectIds = (currentUser.likedProfiles || [])
      .map((id: string) => new mongoose.Types.ObjectId(id))

    // Find mutual matches: profiles that I liked AND liked me back
    const mutualMatches = await profiles.find({
      likedProfiles: myIdString, // they liked me (stored as string)
      _id: { $in: likedObjectIds } // I liked them (converted to ObjectIds)
    }).toArray()

    // Get the last login time
    const lastLoginAt = currentUser.lastLoginAt || new Date(Date.now() - 24 * 60 * 60 * 1000)
    
  const newMatches = mutualMatches.filter((match: any) => {
      // Consider a match "new" if it was created after the last login
      return match.createdAt && new Date(match.createdAt) > new Date(lastLoginAt)
    })

    // Check for unread match notifications
    const unreadNotifications = (currentUser.matchNotifications || [])
      .filter((notification: any) => !notification.read)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Transform the data to include only necessary fields
  const transformedMatches = newMatches.map((profile: any) => ({
      _id: profile._id.toString(),
      name: profile.name,
      userType: profile.userType,
      profileImage: profile.profileImage || "",
      email: profile.email,
      createdAt: profile.createdAt
    }))

    // Transform match notifications
    const transformedNotifications = unreadNotifications.map((notification: any) => ({
      name: notification.matchName,
      userType: notification.matchUserType,
      profileImage: notification.matchProfileImage || "",
      email: notification.matchEmail,
      createdAt: notification.createdAt,
      isNotification: true
    }))

    // Combine new matches and unread notifications, prioritizing notifications
    const allNewMatches = [...transformedNotifications, ...transformedMatches]

    return NextResponse.json({ 
      success: true, 
      newMatches: allNewMatches,
      count: allNewMatches.length,
      unreadNotifications: transformedNotifications
    })
  } catch (err) {
    console.error("New matches fetch error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
