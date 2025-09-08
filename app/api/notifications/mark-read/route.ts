import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// POST - Mark notification(s) as read
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const notifications = await getCollection("notifications");
    
    // Update the notification to mark as read
    const result = await notifications.updateOne(
      { 
        _id: new ObjectId(notificationId),
        toUserEmail: user.email // Ensure user can only mark their own notifications as read
      },
      { 
        $set: { 
          read: true,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
