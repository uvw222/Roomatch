import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { matchEmail } = await req.json()

    if (!matchEmail) {
      return NextResponse.json({ success: false, error: "Match email is required" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")
    
    // Mark the specific match notification as read
    const result = await profiles.updateOne(
      { 
        email: user.email,
        "matchNotifications.matchEmail": matchEmail 
      },
      { 
        $set: { 
          "matchNotifications.$.read": true 
        } 
      } as any
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notifications read error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
