import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, userType } = body

    if (!name || !email || !password || !userType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")

    const existing = await profiles.findOne({ email })
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await profiles.insertOne({
      name,
      email,
      password: hashedPassword,
      userType,
      profileImage: "",
      bio: "",
      budget: 0,
      moveInDate: "",
      location: "",
      hasPets: false,
      isSmoker: false,
      views: 0,
      lifestyle: {
        cleanliness: 50,
        noise: 50,
        guestsFrequency: 50,
        sleepSchedule: "average",
      },
      preferences: {
        ageRange: [18, 40],
        genderPreference: "any",
        petsAllowed: true,
        smokingAllowed: false,
      },
      createdAt: new Date(),
    })

    // Set authentication cookie for the new user
    const response = NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 })
    
    response.cookies.set("user_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
