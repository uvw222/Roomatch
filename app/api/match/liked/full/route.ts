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

  const likedIds = (currentUser.likedProfiles || []).map((id: string) => new mongoose.Types.ObjectId(id))

    const likedProfiles = await profiles.find({ _id: { $in: likedIds } }).toArray()

    // Transform the data to include only necessary fields
  const transformedProfiles = likedProfiles.map((profile: any) => ({
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
      createdAt: profile.createdAt
    }))

    return NextResponse.json({ 
      success: true, 
      profiles: transformedProfiles,
      count: transformedProfiles.length
    })
  } catch (err) {
    console.error("Fetch liked full profiles error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
