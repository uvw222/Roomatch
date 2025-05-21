// app/api/register/route.ts

import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import bcrypt from "bcryptjs" // you’ll need to install this

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, userType } = body

    // ✅ Basic Validation
    if (!name || !email || !password || !userType) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const db = (await connectToDatabase()).connection.db
    const profiles = db.collection("profiles")

    // ✅ Check for existing user
    const existing = await profiles.findOne({ email })
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 })
    }

    // ✅ Hash the password (recommended before storing)
    const hashedPassword = await bcrypt.hash(password, 10)

    // ✅ Insert new profile with defaults
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

    return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
