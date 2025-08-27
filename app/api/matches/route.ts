import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth, getOppositeUserType } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await requireAuth()

    const profiles = await getCollection("profiles")
    const currentUser = await profiles.findOne({ email: user.email })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Get opposite user type (renters see landlords, landlords see renters)
    const oppositeType = getOppositeUserType(currentUser.userType)

    // Convert all excluded profile IDs to ObjectId
    // Only exclude profiles that the current user has already liked or disliked
    const excludedIds = [
      ...(currentUser.likedProfiles || []),
      ...(currentUser.dislikedProfiles || [])
    ].map(id => new ObjectId(id))

    console.log("Debug - Current user:", {
      email: currentUser.email,
      userType: currentUser.userType,
      oppositeType: oppositeType,
      likedProfiles: currentUser.likedProfiles,
      dislikedProfiles: currentUser.dislikedProfiles,
      excludedIds: excludedIds
    })

    // Find profiles that match the criteria:
    // 1. Opposite user type
    // 2. Not already liked or disliked by current user
    // 3. Not the current user
    // 4. Has completed profile (has name and basic info)
    const matches = await profiles.find({
      userType: oppositeType,
      _id: {
        $nin: [...excludedIds, currentUser._id]  // Exclude self and profiles current user has interacted with
      },
      name: { $exists: true, $ne: "" } // Must have a name
      // Temporarily removed profile completion requirements to debug
      // $or: [
      //   { profileImage: { $exists: true, $ne: "" } }, // Has profile image
      //   { bio: { $exists: true, $ne: "" } } // Or has bio
      // ]
    }).limit(50).toArray() // Limit results for performance

    console.log("Debug - Found matches:", matches.length)
    console.log("Debug - Match details:", matches.map(m => ({
      _id: m._id.toString(),
      name: m.name,
      userType: m.userType,
      hasProfileImage: !!m.profileImage,
      hasBio: !!m.bio
    })))

    // Transform the data to include only necessary fields
    const transformedMatches = matches.map(profile => ({
      _id: profile._id.toString(),
      name: profile.name,
      age: profile.age,
      occupation: profile.occupation,
      location: profile.location,
      bio: profile.bio,
      budget: profile.budget,
      cleanliness: profile.lifestyle?.cleanliness || 50,
      interests: profile.interests || [],
      profileImage: profile.profileImage || "",
      userType: profile.userType,
      hasPets: profile.hasPets,
      isSmoker: profile.isSmoker,
      lifestyle: profile.lifestyle,
      moveInDate: profile.moveInDate
    }))

    return NextResponse.json({ 
      success: true, 
      matches: transformedMatches,
      userType: currentUser.userType,
      oppositeType: oppositeType,
      debug: {
        currentUserEmail: currentUser.email,
        currentUserType: currentUser.userType,
        oppositeType: oppositeType,
        excludedIds: excludedIds.map(id => id.toString()),
        totalProfilesFound: matches.length
      }
    })
  } catch (err) {
    console.error("Match fetch error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
