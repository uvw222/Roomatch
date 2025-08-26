// app/api/match/like/route.ts
import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { targetProfileId } = await req.json()

    if (!targetProfileId) {
      return NextResponse.json({ success: false, error: "Target profile ID is required" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")
    const currentUser = await profiles.findOne({ email: user.email })
    
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Validate that target profile exists and is of opposite type
    const targetProfile = await profiles.findOne({ _id: new ObjectId(targetProfileId) })
    if (!targetProfile) {
      return NextResponse.json({ success: false, error: "Target profile not found" }, { status: 404 })
    }

    // Ensure users can only like profiles of opposite type
    if (targetProfile.userType === currentUser.userType) {
      return NextResponse.json({ success: false, error: "Cannot like profiles of same user type" }, { status: 400 })
    }

    // Add to liked profiles if not already there
    if (!currentUser.likedProfiles.includes(targetProfileId)) {
      await profiles.updateOne(
        { email: user.email },
        { $push: { likedProfiles: targetProfileId } }
      )
    }

    // Remove from disliked profiles if it was there
    if (currentUser.dislikedProfiles?.includes(targetProfileId)) {
      await profiles.updateOne(
        { email: user.email },
        { $pull: { dislikedProfiles: targetProfileId } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
