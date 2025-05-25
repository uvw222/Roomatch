// app/api/match/dislike/route.ts
import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  await connectToDatabase()
  const { targetProfileId } = await req.json()
const cookieStore = await cookies()
  const userEmail = cookieStore.get("userEmail")?.value

  if (!userEmail || !targetProfileId) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }

  const currentUser = await Profile.findOne({ email: userEmail })
  if (!currentUser) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
  }

  if (!currentUser.dislikedProfiles.includes(targetProfileId)) {
    currentUser.dislikedProfiles.push(targetProfileId)
    await currentUser.save()
  }

  return NextResponse.json({ success: true })
}
