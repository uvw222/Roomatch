import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const user = await requireAuth()
    const { username } = params

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")
    
    // Try to find profile by name (username)
    const profile = await profiles.findOne({ 
      name: { $regex: new RegExp(`^${username}$`, 'i') } // Case-insensitive exact match
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    // Don't return the profile if it's the current user's own profile
    if (profile.email === user.email) {
      return NextResponse.json({ success: false, error: "Cannot view own profile" }, { status: 403 })
    }

    // Transform the data to include only necessary fields
    const transformedProfile = {
      _id: profile._id.toString(),
      name: profile.name,
      age: profile.age,
      bio: profile.bio,
      profileImage: profile.profileImage || "",
      occupation: profile.occupation,
      location: profile.location,
      email: profile.email,
      coordinates: profile.coordinates,
      budget: profile.budget,
      views: profile.views || 0,
      userType: profile.userType,
      moveInDate: profile.moveInDate,
      hasPets: profile.hasPets,
      isSmoker: profile.isSmoker,
      lifestyle: profile.lifestyle,
      preferences: profile.preferences
    }

    return NextResponse.json({ 
      success: true, 
      profile: transformedProfile
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

