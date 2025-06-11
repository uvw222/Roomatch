import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get("user_email")?.value;

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Not logged in" },
      { status: 401 }
    );
  }

  try {
    const profiles = await getCollection("profiles");

    const profile = await profiles.findOne({ email });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: profile.name,
        age: profile.age,
        occupation: profile.occupation,
        location: profile.location,
        bio: profile.bio,
        profileImage: profile.profileImage || "",
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
