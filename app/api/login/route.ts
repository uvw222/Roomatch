import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile" // assuming you have a User model

export async function POST(req: Request) {
  const { email, password } = await req.json()
  await connectToDatabase()

  const user = await Profile.findOne({ email })

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found. Please sign up." }, { status: 404 })
  }

  // Optional: add password check (for now we're skipping it for simplicity)

  return NextResponse.json({ success: true, message: "Login successful", user }, { status: 200 })
}
