import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const email = user.email;

  const url  = new URL(req.url!);
  const mode = url.searchParams.get("mode");
  const messages = await getCollection("messages");

  /* ---------- CONTACTS LIST ---------- */
  if (mode === "contacts") {
    // ➜ pull every message involving me (no sort)
    const all = await messages
      .find({ $or: [{ from: email }, { to: email }] })
      .toArray();

    // JS aggregate: map[otherEmail] -> { lastMessage, lastTime, unread }
    const map: Record<
      string,
      { lastMessage: string; lastTime: Date; unread: number }
    > = {};

    for (const m of all) {
      const other = m.from === email ? m.to : m.from;
      if (!map[other]) {
        map[other] = {
          lastMessage: m.text,
          lastTime: m.timestamp,
          unread: 0,
        };
      }
      // update “last” if this msg newer
      if (new Date(m.timestamp) > new Date(map[other].lastTime)) {
        map[other].lastMessage = m.text;
        map[other].lastTime    = m.timestamp;
      }
      if (m.to === email && !m.read) map[other].unread += 1;
    }

    // Get profile information for contacts
    const profiles = await getCollection("profiles");
    const contactEmails = Object.keys(map);
    const contactProfiles = await profiles
      .find({ email: { $in: contactEmails } })
      .toArray();
    
    const profileMap = new Map(contactProfiles.map(p => [p.email, p]));

    // convert to array & sort by lastTime DESC in JS
    const contacts = Object.entries(map)
      .sort((a, b) => +new Date(b[1].lastTime) - +new Date(a[1].lastTime))
      .map(([other, info]) => {
        const profile = profileMap.get(other);
        return {
          _id: other,
          email: other,
          name: profile?.name || other.split("@")[0],
          lastMessage: info.lastMessage,
          time: new Date(info.lastTime).toLocaleString(),
          unread: info.unread,
          image: profile?.profileImage || "/placeholder.svg",
          userType: profile?.userType,
        };
      });

    return NextResponse.json({ success: true, contacts });
  }

  /* ---------- FULL CONVERSATION ---------- */
  if (mode === "conversation") {
    const other = url.searchParams.get("other");
    if (!other)
      return NextResponse.json(
        { success: false, message: "`other` query param required" },
        { status: 400 },
      );

    const convo = await messages
      .find({
        $or: [
          { from: email, to: other },
          { from: other, to: email },
        ],
      })
      .toArray();

    // sort ascending by timestamp in JS
    convo.sort(
      (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp),
    );

    return NextResponse.json({ success: true, messages: convo });
  }

  return NextResponse.json(
    { success: false, message: "Invalid mode" },
    { status: 400 },
  );
  } catch (error) {
    console.error("Messages list error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }
}
