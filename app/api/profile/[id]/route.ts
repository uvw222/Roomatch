import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const profile = await Profile.findById(params.id).lean()

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        _id: profile._id?.toString(),
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        profileImage: profile.profileImage,
        occupation: profile.occupation,
        location: profile.location,
        coordinates: profile.coordinates,
        budget: profile.budget,
        views: profile.views,
        userType: profile.userType,
        moveInDate: profile.moveInDate,
        hasPets: profile.hasPets,
        isSmoker: profile.isSmoker,
        lifestyle: profile.lifestyle,
        preferences: profile.preferences,
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
