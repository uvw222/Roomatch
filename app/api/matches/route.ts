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

    const currentUser = await Profile.findOne({ email: userEmail })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const oppositeType = currentUser.userType === "renter" ? "landlord" : "renter"
    const matches = await Profile.find({ userType: oppositeType })

    return NextResponse.json({ success: true, matches })
  } catch (err) {
    console.error("Match fetch error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
