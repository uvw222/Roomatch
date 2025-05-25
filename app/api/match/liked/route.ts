import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"
import { cookies } from "next/headers"

export async function GET() {
  try {
    await connectToDatabase()

    const cookieStore = await cookies()
    const userEmail = cookieStore.get("userEmail")?.value

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await Profile.findOne({ email: userEmail })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      likedProfiles: user.likedProfiles,
    })
  } catch (err) {
    console.error("Fetch liked profiles error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
