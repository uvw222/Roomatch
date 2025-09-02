import { Server } from "socket.io";
import { NextApiRequest } from "next";
import { Server as HTTPServer } from "http";
import { Socket as NetSocket } from "net";
import type { NextApiResponse } from "next";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & { server: HTTPServer & { io?: Server } };
};

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("🟢 Initializing new Socket.io server...");
    const io = new Server(res.socket.server as any, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("✅ New socket connected:", socket.id);

      // Join the user's private room
      socket.on("join", (email: string) => {
        socket.join(email);
        console.log(`📥 ${email} joined their room`);
      });

      // Send message to a specific user room
      socket.on("send", (msg) => {
        const { to } = msg;
        if (to) {
          io.to(to).emit("message", msg);
          console.log(`📤 Message sent to ${to}:`, msg);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔌 Socket disconnected:", socket.id);
      });
    });
  } else {
    console.log("🟡 Socket.io server already running.");
  }

  res.end();
};

export default SocketHandler;
