import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET - List notifications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const notifications = await getCollection("notifications");
    
    // Get notifications for this user
    const userNotifications = await notifications
      .find({ toUserEmail: user.email })
      .limit(50)
      .toArray();

    // Sort in JavaScript instead of MongoDB due to Cosmos DB indexing limitations
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      notifications: userNotifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create a new notification (internal use)
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
    const {
      type,
      title,
      message,
      toUserEmail,
      fromUser,
      data = {}
    } = body;

    // Validation
    if (!type || !title || !message || !toUserEmail || !fromUser) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create notification
    const notificationData = {
      type,
      title,
      message,
      toUserEmail,
      fromUser: {
        email: fromUser.email,
        name: fromUser.name,
        profileImage: fromUser.profileImage
      },
      data,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const notifications = await getCollection("notifications");
    const result = await notifications.insertOne(notificationData);

    const createdNotification = {
      _id: result.insertedId,
      ...notificationData
    };

    // TODO: Send real-time notification via socket
    // Will be implemented with socket integration

    return NextResponse.json({
      success: true,
      notification: createdNotification
    });

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
