// app/api/match/like/route.ts
import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { getSocket } from "@/lib/socket"
import { createMatchNotification } from "@/lib/notificationHelpers"

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { targetProfileId } = await req.json()

    if (!targetProfileId) {
      return NextResponse.json({ success: false, error: "Target profile ID is required" }, { status: 400 })
    }

    const profiles = await getCollection("profiles")
    const currentUser = await profiles.findOne({ email: user.email })
    
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Validate that target profile exists and is of opposite type
    const targetProfile = await profiles.findOne({ _id: new ObjectId(targetProfileId) })
    if (!targetProfile) {
      return NextResponse.json({ success: false, error: "Target profile not found" }, { status: 404 })
    }

    // Ensure users can only like profiles of opposite type
    if (targetProfile.userType === currentUser.userType) {
      return NextResponse.json({ success: false, error: "Cannot like profiles of same user type" }, { status: 400 })
    }

    // Add to liked profiles if not already there
    if (!currentUser.likedProfiles.includes(targetProfileId)) {
      await profiles.updateOne(
        { email: user.email },
        { $push: { likedProfiles: targetProfileId } }
      )
    }

    // Remove from disliked profiles if it was there
    if (currentUser.dislikedProfiles?.includes(targetProfileId)) {
      await profiles.updateOne(
        { email: user.email },
        { $pull: { dislikedProfiles: targetProfileId } }
      )
    }

    // Check if this creates a mutual match
    let matchData = null
    if (targetProfile.likedProfiles?.includes(currentUser._id.toString())) {
      // It's a mutual match! Send notifications to both users
      const io = getSocket()
      
      // Store match notification for current user (in case they're offline)
      await profiles.updateOne(
        { email: user.email },
        { 
          $push: { 
            matchNotifications: {
              matchEmail: targetProfile.email,
              matchName: targetProfile.name,
              matchUserType: targetProfile.userType,
              matchProfileImage: targetProfile.profileImage,
              createdAt: new Date(),
              read: false
            }
          } 
        } as any
      )

      // Store match notification for target user (in case they're offline)
      await profiles.updateOne(
        { email: targetProfile.email },
        { 
          $push: { 
            matchNotifications: {
              matchEmail: currentUser.email,
              matchName: currentUser.name,
              matchUserType: currentUser.userType,
              matchProfileImage: currentUser.profileImage,
              createdAt: new Date(),
              read: false
            }
          } 
        } as any
      )

      // Create new notifications for both users
      await createMatchNotification(
        user.email,
        {
          email: targetProfile.email,
          name: targetProfile.name,
          profileImage: targetProfile.profileImage
        }
      );

      await createMatchNotification(
        targetProfile.email,
        {
          email: currentUser.email,
          name: currentUser.name,
          profileImage: currentUser.profileImage
        }
      );

      // Prepare match data for response
      matchData = {
        name: targetProfile.name,
        userType: targetProfile.userType,
        profileImage: targetProfile.profileImage,
        email: targetProfile.email
      }

      if (io) {
        // Send real-time notification to the current user
        io.to(user.email).emit('newMatch', {
          type: 'newMatch',
          match: matchData
        })

        // Send real-time notification to the target user
        io.to(targetProfile.email).emit('newMatch', {
          type: 'newMatch',
          match: {
            name: currentUser.name,
            userType: currentUser.userType,
            profileImage: currentUser.profileImage,
            email: currentUser.email
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      isMatch: !!matchData,
      match: matchData
    })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
