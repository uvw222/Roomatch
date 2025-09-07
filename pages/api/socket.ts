import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & { server: HTTPServer & { io?: IOServer } };
};

export default function SocketHandler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log(" Initializing Socket.io server @ /api/socket");
    const io = new IOServer(res.socket.server as unknown as HTTPServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    res.socket.server.io = io;
    (global as any)._io = io;

    io.on("connection", (socket) => {
      console.log(" Socket connected:", socket.id);

      socket.on("join", (email: string) => {
        if (email) {
          socket.join(email);
          console.log(` ${email} joined room`);
        }
      });

      socket.on("disconnect", () => {
        console.log(" Socket disconnected:", socket.id);
      });
    });
  } else {
    (global as any)._io = res.socket.server.io;
    console.log(" Reusing existing Socket.io server");
  }

  res.end();
}
