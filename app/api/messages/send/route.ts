// app/api/messages/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSocket } from "@/lib/socket";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    /* ---------- who is sending? ---------- */
    const user = await requireAuth(req);
    const from = user.email;

    /* ---------- body ---------- */
    const { to, text } = await req.json();
    if (!to || !text?.trim())
      return NextResponse.json({ success: false, message: "Missing 'to' or 'text'" }, { status: 400 });

    /* ---------- validate recipient ---------- */
    const profiles = await getCollection("profiles");
    const recipient = await profiles.findOne({ email: to });
    if (!recipient) {
      return NextResponse.json({ success: false, message: "Recipient not found" }, { status: 404 });
    }

    /* ---------- insert & build payload ---------- */
    const messages = await getCollection("messages");
    const saved = await messages.insertOne({
      from,
      to,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
    });

    const payload = {
      _id: saved.insertedId,
      from,
      to,
      text: text.trim(),
      timestamp: new Date(),
      read: false,
    };

    /* ---------- socket broadcast ---------- */
    const io = getSocket();
    io?.to(from).to(to).emit("messages:new", payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
}
