// app/api/match/dislike/route.ts
import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import mongoose from 'mongoose'

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

    // Validate that target profile exists
  const targetProfile = await profiles.findOne({ _id: new mongoose.Types.ObjectId(targetProfileId) })
    if (!targetProfile) {
      return NextResponse.json({ success: false, error: "Target profile not found" }, { status: 404 })
    }

    // Add to disliked profiles if not already there
    if (!currentUser.dislikedProfiles?.includes(targetProfileId)) {
      await profiles.updateOne(
        { email: user.email },
        { $push: { dislikedProfiles: targetProfileId } }
      )
    }

    // Remove from liked profiles if it was there
    if (currentUser.likedProfiles?.includes(targetProfileId)) {
      await profiles.updateOne(
        { email: user.email },
        { $pull: { likedProfiles: targetProfileId } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Dislike error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
