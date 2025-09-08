import { getCollection } from "@/lib/db";

export interface CreateNotificationData {
  type: 'new_match' | 'meeting_request' | 'meeting_approved' | 'meeting_declined'
  title: string
  message: string
  toUserEmail: string
  fromUser: {
    email: string
    name: string
    profileImage?: string
  }
  data?: any
}

export async function createNotification(notificationData: CreateNotificationData) {
  try {
    const notifications = await getCollection("notifications");
    
    const notification = {
      ...notificationData,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await notifications.insertOne(notification);
    
    return {
      success: true,
      notification: {
        _id: result.insertedId,
        ...notification
      }
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    return {
      success: false,
      error: "Failed to create notification"
    };
  }
}

// Helper function to create a match notification
export async function createMatchNotification(
  toUserEmail: string,
  fromUser: { email: string, name: string, profileImage?: string }
) {
  return createNotification({
    type: 'new_match',
    title: 'New Match! 🎉',
    message: `You have a new match with ${fromUser.name}! Start chatting now.`,
    toUserEmail,
    fromUser,
    data: {
      matchedUserEmail: fromUser.email
    }
  });
}

// Helper function to create a meeting request notification
export async function createMeetingRequestNotification(
  toUserEmail: string,
  fromUser: { email: string, name: string, profileImage?: string },
  meetingDetails: { date: Date, time: string, locationType: string, meetingId?: string }
) {
  return createNotification({
    type: 'meeting_request',
    title: 'New Meeting Request 📅',
    message: `${fromUser.name} wants to schedule a meeting with you on ${meetingDetails.date.toLocaleDateString()} at ${meetingDetails.time}.`,
    toUserEmail,
    fromUser,
    data: {
      meetingDate: meetingDetails.date,
      meetingTime: meetingDetails.time,
      locationType: meetingDetails.locationType,
      meetingId: meetingDetails.meetingId
    }
  });
}

// Helper function to create a meeting approved notification
export async function createMeetingApprovedNotification(
  toUserEmail: string,
  fromUser: { email: string, name: string, profileImage?: string },
  meetingDetails: { date: Date, time: string, locationType: string }
) {
  return createNotification({
    type: 'meeting_approved',
    title: 'Meeting Approved! ✅',
    message: `${fromUser.name} approved your meeting request for ${meetingDetails.date.toLocaleDateString()} at ${meetingDetails.time}.`,
    toUserEmail,
    fromUser,
    data: {
      meetingDate: meetingDetails.date,
      meetingTime: meetingDetails.time,
      locationType: meetingDetails.locationType
    }
  });
}

// Helper function to create a meeting declined notification
export async function createMeetingDeclinedNotification(
  toUserEmail: string,
  fromUser: { email: string, name: string, profileImage?: string },
  meetingDetails: { date: Date, time: string, locationType: string }
) {
  return createNotification({
    type: 'meeting_declined',
    title: 'Meeting Declined',
    message: `${fromUser.name} declined your meeting request for ${meetingDetails.date.toLocaleDateString()}.`,
    toUserEmail,
    fromUser,
    data: {
      meetingDate: meetingDetails.date,
      meetingTime: meetingDetails.time,
      locationType: meetingDetails.locationType
    }
  });
}
