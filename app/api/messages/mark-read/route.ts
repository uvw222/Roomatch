// app/api/messages/mark-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import mongoose from 'mongoose';
import { getSocket } from "@/lib/socket";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    /* 1. who? */
    const user = await requireAuth(req);
    const me = user.email;

  /* 2. body may be { messageIds } OR { other } */
  const { messageIds = [], other } = await req.json();

  const messages = await getCollection("messages");
  const filter = other
    ? { from: other, to: me, read: false }
    : {
      _id: { $in: messageIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
        to: me,
      };

  await messages.updateMany(filter, { $set: { read: true } });

  /* 3. notify peers */
  const io = getSocket();
  io?.to(me).to(other ?? "").emit("messages:read", { otherEmail: me });

  return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
}
