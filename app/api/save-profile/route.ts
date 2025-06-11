import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Profile from "@/models/Profile";

// Handle POST requests to update an existing profile
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, upsert: false }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Optional: respond to GET requests with method not allowed
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}
