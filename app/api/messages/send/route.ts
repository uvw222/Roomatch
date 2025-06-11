// app/api/messages/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import { getSocket } from "@/lib/socket";

export async function POST(req: NextRequest) {
  /* ---------- who is sending? ---------- */
  const cookieStore = await cookies();                            // ← await required
const from = cookieStore.get("user_email")?.value;

  if (!from)
    return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });

  /* ---------- body ---------- */
  const { to, text } = await req.json();
  if (!to || !text?.trim())
    return NextResponse.json({ success: false, message: "Missing 'to' or 'text'" }, { status: 400 });

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
}
