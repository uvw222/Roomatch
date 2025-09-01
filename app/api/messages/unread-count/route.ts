import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireAuth()
    
    const messages = await getCollection("messages")
    const unreadCount = await messages.countDocuments({ 
      to: user.email, 
      read: false 
    })

    return NextResponse.json({ 
      success: true, 
      count: unreadCount 
    })
  } catch (error) {
    console.error("Unread count error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to get unread count" },
      { status: 500 }
    )
  }
}
