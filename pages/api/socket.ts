import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (global._io) return res.status(200).end();

  const httpServer: any = (res.socket as any).server;
  const io = new IOServer(httpServer, { path: "/api/socket" });
  global._io = io;

  console.log("🟢 Socket.IO server booted");

  io.on("connection", (socket) => {
    console.log("🔗 client connected:", socket.id);
    socket.on("join", (email: string) => {
      socket.join(email);
      console.log("📥 joined room", email, "sid:", socket.id);
    });
  });

  res.status(200).end();
}
