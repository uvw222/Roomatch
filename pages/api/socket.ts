// pages/api/socket.ts
import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

// Disable body parsing so raw socket stream can be used
export const config = {
  api: {
    bodyParser: false,
  },
};

// Global type fix for TypeScript
declare global {
  // Prevent `globalThis._io` from being cleared by HMR
  var _io: IOServer | undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io)
 {
    console.warn("❌ No socket server instance found on response.");
    return res.status(500).end();
  }

  if (!global._io) {
    console.log("🟢 Booting Socket.IO server...");

    const io = new IOServer((res.socket as any).server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      connectTimeout: 60000, // 60 seconds
      pingTimeout: 60000, // 60 seconds  
      pingInterval: 25000, // 25 seconds
      transports: ["websocket", "polling"],
    });

    global._io = io;

    io.on("connection", (socket) => {
      console.log("🔗 client connected:", socket.id);

      socket.on("join", (email: string) => {
        socket.join(email);
        console.log("📥 joined room", email, "sid:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 client disconnected:", socket.id, "reason:", reason);
      });

      socket.on("error", (error) => {
        console.error("❌ socket error:", error);
      });

      // Handle connection errors
      socket.on("connect_error", (error) => {
        console.error("❌ connection error:", error);
      });
    });
  } else {
    console.log("⚠️ Socket.IO already initialized.");
  }

  res.end();
}
