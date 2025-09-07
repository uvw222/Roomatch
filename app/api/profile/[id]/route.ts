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

    // Ensure profile is a single object, not an array
    const profileData = Array.isArray(profile) ? profile[0] : profile

    if (!profileData) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: {
        _id: profileData._id?.toString(),
        name: profileData.name,
        age: profileData.age,
        bio: profileData.bio,
        profileImage: profileData.profileImage,
        galleryImages: profileData.galleryImages || [],
        occupation: profileData.occupation,
        location: profileData.location,
        coordinates: profileData.coordinates,
        budget: profileData.budget,
        views: profileData.views,
        userType: profileData.userType,
        moveInDate: profileData.moveInDate,
        hasPets: profileData.hasPets,
        isSmoker: profileData.isSmoker,
        lifestyle: profileData.lifestyle,
        preferences: profileData.preferences,
        renterInfo: profileData.renterInfo,
        landlordInfo: profileData.landlordInfo,
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
