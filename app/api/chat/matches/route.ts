import { NextResponse } from "next/server"
import { getCollection } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await requireAuth()

    const profiles = await getCollection("profiles")
    const currentUser = await profiles.findOne({ email: user.email })

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const myIdString = currentUser._id.toString()
    const likedObjectIds = (currentUser.likedProfiles || [])
      .map((id: string) => new ObjectId(id))

    // Find mutual matches: profiles that I liked AND liked me back
    const mutualMatches = await profiles.find({
      likedProfiles: myIdString, // they liked me (stored as string)
      _id: { $in: likedObjectIds } // I liked them (converted to ObjectIds)
    }).toArray()

    // Get messages to determine last message and unread count
    const messages = await getCollection("messages")
    const allMessages = await messages
      .find({ $or: [{ from: user.email }, { to: user.email }] })
      .toArray()

    // Create a map of last messages and unread counts
    const messageMap: Record<string, { lastMessage: string; lastTime: Date; unread: number }> = {}

    for (const m of allMessages) {
      const other = m.from === user.email ? m.to : m.from
      if (!messageMap[other]) {
        messageMap[other] = {
          lastMessage: m.text,
          lastTime: m.timestamp,
          unread: 0,
        }
      }
      // update "last" if this msg newer
      if (new Date(m.timestamp) > new Date(messageMap[other].lastTime)) {
        messageMap[other].lastMessage = m.text
        messageMap[other].lastTime = m.timestamp
      }
      if (m.to === user.email && !m.read) messageMap[other].unread += 1
    }

    // Transform the data to include chat information
    const transformedMatches = mutualMatches.map(profile => {
      const chatInfo = messageMap[profile.email] || {
        lastMessage: "Start a conversation!",
        lastTime: new Date(),
        unread: 0
      }

      return {
        _id: profile._id.toString(),
        name: profile.name,
        email: profile.email,
        profileImage: profile.profileImage || "",
        lastMessage: chatInfo.lastMessage,
        lastTime: chatInfo.lastTime,
        unread: chatInfo.unread,
        time: new Date(chatInfo.lastTime).toLocaleString()
      }
    })

    // Sort by last message time (most recent first)
    transformedMatches.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())

    return NextResponse.json({ 
      success: true, 
      matches: transformedMatches,
      count: transformedMatches.length
    })
  } catch (err) {
    console.error("Chat matches fetch error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
