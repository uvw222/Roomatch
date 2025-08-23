import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Profile from "@/models/Profile"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()
    
    const result = await Profile.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    )

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing profile views:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
