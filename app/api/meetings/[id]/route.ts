import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { createMeetingApprovedNotification, createMeetingDeclinedNotification } from "@/lib/notificationHelpers";

// GET - Get specific meeting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const meetingId = (await params).id;

    if (!ObjectId.isValid(meetingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid meeting ID" },
        { status: 400 }
      );
    }

    const meetings = await getCollection("meetings");
    const meeting = await meetings.findOne({ 
      _id: new ObjectId(meetingId),
      $or: [
        { requesterEmail: user.email },
        { participantEmail: user.email }
      ]
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      meeting
    });

  } catch (error) {
    console.error("Error fetching meeting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

// PUT - Update meeting
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const meetingId = (await params).id;
    const body = await request.json();

    if (!ObjectId.isValid(meetingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid meeting ID" },
        { status: 400 }
      );
    }

    const meetings = await getCollection("meetings");
    const meeting = await meetings.findOne({ 
      _id: new ObjectId(meetingId),
      $or: [
        { requesterEmail: user.email },
        { participantEmail: user.email }
      ]
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Only allow updates from the original requester or if it's a confirmation
    if (meeting.requesterEmail !== user.email && body.action !== 'confirm') {
      return NextResponse.json(
        { success: false, error: "Only the meeting creator can update meeting details" },
        { status: 403 }
      );
    }

    let updateData: any = {
      updatedAt: new Date()
    };

    if (body.action === 'confirm') {
      // Participant confirming the meeting
      if (meeting.participantEmail === user.email) {
        updateData.participantConfirmed = true;
        // Since requester auto-confirms when creating, set status to confirmed
        updateData.status = 'confirmed';
        
        // Create notification for the requester
        const profiles = await getCollection("profiles");
        const participantProfile = await profiles.findOne({ email: user.email });
        
        await createMeetingApprovedNotification(
          meeting.requesterEmail,
          {
            email: user.email,
            name: user.name,
            profileImage: participantProfile?.profileImage
          },
          {
            date: meeting.date,
            time: meeting.time,
            locationType: meeting.locationType
          }
        );
      } else if (meeting.requesterEmail === user.email) {
        // If requester is confirming (shouldn't normally happen since they auto-confirm)
        updateData.requesterConfirmed = true;
        if (meeting.participantConfirmed) {
          updateData.status = 'confirmed';
        }
      } else {
        return NextResponse.json(
          { success: false, error: "You are not authorized to confirm this meeting" },
          { status: 403 }
        );
      }
    } else if (body.action === 'reschedule') {
      // Reschedule meeting
      const { date, time, locationType, address, notes } = body;
      
      updateData = {
        ...updateData,
        date: new Date(date),
        time,
        locationType,
        address: address || meeting.address,
        notes: notes || meeting.notes,
        status: 'pending',
        requesterConfirmed: meeting.requesterEmail === user.email,
        participantConfirmed: meeting.participantEmail === user.email,
        isReschedule: true
      };
    } else {
      // Regular update
      const { date, time, locationType, address, notes, description } = body;
      
      if (date) updateData.date = new Date(date);
      if (time) updateData.time = time;
      if (locationType) updateData.locationType = locationType;
      if (address !== undefined) updateData.address = address;
      if (notes !== undefined) updateData.notes = notes;
      if (description) updateData.description = description;
    }

    const result = await meetings.updateOne(
      { _id: new ObjectId(meetingId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Get updated meeting
    const updatedMeeting = await meetings.findOne({ _id: new ObjectId(meetingId) });

    // TODO: Send real-time notification to other participant
    // Will be implemented with socket integration

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting
    });

  } catch (error) {
    console.error("Error updating meeting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const meetingId = (await params).id;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'No reason provided';

    if (!ObjectId.isValid(meetingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid meeting ID" },
        { status: 400 }
      );
    }

    const meetings = await getCollection("meetings");
    const meeting = await meetings.findOne({ 
      _id: new ObjectId(meetingId),
      $or: [
        { requesterEmail: user.email },
        { participantEmail: user.email }
      ]
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Update meeting status to cancelled instead of deleting
    const result = await meetings.updateOne(
      { _id: new ObjectId(meetingId) },
      { 
        $set: { 
          status: 'cancelled',
          cancelledBy: user.email,
          cancellationReason: reason,
          updatedAt: new Date()
        }
      }
    );

    // Create notification for the other participant
    const otherUserEmail = meeting.requesterEmail === user.email 
      ? meeting.participantEmail 
      : meeting.requesterEmail;
    
    const profiles = await getCollection("profiles");
    const cancellerProfile = await profiles.findOne({ email: user.email });
    
    await createMeetingDeclinedNotification(
      otherUserEmail,
      {
        email: user.email,
        name: user.name,
        profileImage: cancellerProfile?.profileImage
      },
      {
        date: meeting.date,
        time: meeting.time,
        locationType: meeting.locationType
      }
    );

    // TODO: Send real-time notification via socket
    // Will be implemented with socket integration

    return NextResponse.json({
      success: true,
      message: "Meeting cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling meeting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel meeting" },
      { status: 500 }
    );
  }
}
