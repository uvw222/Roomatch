import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST - Mark all notifications as read for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const notifications = await getCollection("notifications");
    
    // Update all unread notifications for this user
    const result = await notifications.updateMany(
      { 
        toUserEmail: user.email,
        read: false
      },
      { 
        $set: { 
          read: true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
