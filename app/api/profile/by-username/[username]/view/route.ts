import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const user = await requireAuth()
    const { username } = params

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")
    
    // Find profile by name (username)
    const profile = await profiles.findOne({ 
      name: { $regex: new RegExp(`^${username}$`, 'i') } // Case-insensitive exact match
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    // Increment view count
    await profiles.updateOne(
      { _id: profile._id },
      { $inc: { views: 1 } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile view increment error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

