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

    // Transform the data to include only necessary fields
  const transformedMatches = mutualMatches.map((profile: any) => ({
      _id: profile._id.toString(),
      name: profile.name,
      age: profile.age,
      occupation: profile.occupation,
      location: profile.location,
      bio: profile.bio,
      budget: profile.budget,
      cleanliness: profile.lifestyle?.cleanliness || 50,
      interests: profile.interests || [],
      profileImage: profile.profileImage || "",
      userType: profile.userType,
      hasPets: profile.hasPets,
      isSmoker: profile.isSmoker,
      lifestyle: profile.lifestyle,
      moveInDate: profile.moveInDate,
      createdAt: profile.createdAt,
      email: profile.email
    }))

    return NextResponse.json({ 
      success: true, 
      matches: transformedMatches,
      count: transformedMatches.length
    })
  } catch (err) {
    console.error("Mutual matches fetch error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
