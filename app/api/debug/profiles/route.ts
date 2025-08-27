import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const targetEmail = searchParams.get('targetEmail')

    if (!targetEmail) {
      return NextResponse.json({ success: false, error: "Target email is required" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")
    
    // Get current user profile
    const currentUser = await profiles.findOne({ email: user.email })
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Current user not found" }, { status: 404 })
    }

    // Get target user profile
    const targetUser = await profiles.findOne({ email: targetEmail })
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target user not found" }, { status: 404 })
    }

    // Check if current user has liked/disliked target user
    const currentUserLikedTarget = currentUser.likedProfiles?.includes(targetUser._id.toString()) || false
    const currentUserDislikedTarget = currentUser.dislikedProfiles?.includes(targetUser._id.toString()) || false

    // Check if target user has liked/disliked current user
    const targetUserLikedCurrent = targetUser.likedProfiles?.includes(currentUser._id.toString()) || false
    const targetUserDislikedCurrent = targetUser.dislikedProfiles?.includes(currentUser._id.toString()) || false

    return NextResponse.json({
      success: true,
      currentUser: {
        email: currentUser.email,
        name: currentUser.name,
        userType: currentUser.userType,
        likedProfiles: currentUser.likedProfiles || [],
        dislikedProfiles: currentUser.dislikedProfiles || [],
        hasProfileImage: !!currentUser.profileImage,
        hasBio: !!currentUser.bio
      },
      targetUser: {
        email: targetUser.email,
        name: targetUser.name,
        userType: targetUser.userType,
        likedProfiles: targetUser.likedProfiles || [],
        dislikedProfiles: targetUser.dislikedProfiles || [],
        hasProfileImage: !!targetUser.profileImage,
        hasBio: !!targetUser.bio
      },
      interactions: {
        currentUserLikedTarget,
        currentUserDislikedTarget,
        targetUserLikedCurrent,
        targetUserDislikedCurrent,
        isMutualMatch: currentUserLikedTarget && targetUserLikedCurrent
      }
    })
  } catch (error) {
    console.error("Debug profiles error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
