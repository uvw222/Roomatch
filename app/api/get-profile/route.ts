import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
  }

  await connectToDatabase()

  const profile = await Profile.findOne({ email })
  if (!profile) {
    return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, profile }, { status: 200 })
}
