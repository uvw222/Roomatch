import type { Server as IOServer } from "socket.io";

export function getSocket(): IOServer | undefined {
  return global._io;          // (declared in global.d.ts)
}