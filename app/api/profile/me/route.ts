import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    const profiles = await getCollection("profiles");
    const profile = await profiles.findOne({ email: user.email });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        _id: profile._id.toString(),
        name: profile.name,
        age: profile.age,
        occupation: profile.occupation,
        location: profile.location,
        bio: profile.bio,
        profileImage: profile.profileImage || "",
        coordinates: profile.coordinates,
        email: profile.email,
        userType: profile.userType,
        views: profile.views,
        likedProfiles: profile.likedProfiles || [],
        dislikedProfiles: profile.dislikedProfiles || [],
        lifestyle: profile.lifestyle,
        preferences: profile.preferences,
        budget: profile.budget,
        moveInDate: profile.moveInDate,
        hasPets: profile.hasPets,
        isSmoker: profile.isSmoker,
        createdAt: profile.createdAt,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
}
