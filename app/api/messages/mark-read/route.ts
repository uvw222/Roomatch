// app/api/messages/mark-read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getSocket } from "@/lib/socket";

export async function POST(req: NextRequest) {
  /* 1. who? */
  const cookieStore = await cookies();
  const me = cookieStore.get("user_email")?.value;
  if (!me) {
    return NextResponse.json(
      { success: false, message: "Not logged in" },
      { status: 401 }
    );
  }

  /* 2. body may be { messageIds } OR { other } */
  const { messageIds = [], other } = await req.json();

  const messages = await getCollection("messages");
  const filter = other
    ? { from: other, to: me, read: false }
    : {
        _id: { $in: messageIds.map((id: string) => new ObjectId(id)) },
        to: me,
      };

  await messages.updateMany(filter, { $set: { read: true } });

  /* 3. notify peers */
  const io = getSocket();
io?.to(me).to(other ?? "").emit("messages:read", { otherEmail: me });

  return NextResponse.json({ success: true });
}
