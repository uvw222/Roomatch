import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createMeetingRequestNotification } from "@/lib/notificationHelpers";

// GET - List meetings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build query
    const query: any = {
      $or: [
        { requesterEmail: user.email },
        { participantEmail: user.email }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const meetings = await getCollection("meetings");
    const userMeetings = await meetings
      .find(query)
      .toArray();

    return NextResponse.json({
      success: true,
      meetings: userMeetings
    });

  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

// POST - Create a new meeting
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
      participantEmail,
      participantName,
      date,
      time,
      locationType,
      address = "",
      notes = "",
      description = ""
    } = body;

    // Validation
    if (!participantEmail || !participantName || !date || !time || !locationType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify participant exists in profiles
    const profiles = await getCollection("profiles");
    const participant = await profiles.findOne({ email: participantEmail });
    
    if (!participant) {
      return NextResponse.json(
        { success: false, error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if users are matched
    const requester = await profiles.findOne({ email: user.email });
    if (!requester) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify they have mutual likes (are matched)
    const isMatched = requester.likedProfiles?.includes(participant._id.toString()) &&
                     participant.likedProfiles?.includes(requester._id.toString());

    if (!isMatched) {
      return NextResponse.json(
        { success: false, error: "Can only schedule meetings with matched users" },
        { status: 403 }
      );
    }

    // Create meeting
    const meetingData = {
      requesterEmail: user.email,
      participantEmail,
      requesterName: user.name,
      participantName,
      date: new Date(date),
      time,
      locationType,
      address,
      notes,
      description: description || `Meeting between ${user.name} and ${participantName}`,
      status: "pending",
      requesterConfirmed: true,
      participantConfirmed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const meetings = await getCollection("meetings");
    const result = await meetings.insertOne(meetingData);

    const createdMeeting = {
      _id: result.insertedId,
      ...meetingData
    };

    // Create notification for the participant
    await createMeetingRequestNotification(
      participantEmail,
      {
        email: user.email,
        name: user.name,
        profileImage: (await profiles.findOne({ email: user.email }))?.profileImage
      },
      {
        date: new Date(date),
        time,
        locationType,
        meetingId: result.insertedId.toString()
      }
    );

    // TODO: Send real-time notification via socket
    // Will be implemented with socket integration

    return NextResponse.json({
      success: true,
      meeting: createdMeeting
    });

  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
