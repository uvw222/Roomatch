import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(meEmail: string) {
  if (socket) return socket;
  console.log("[getSocketClient] Connecting socket..."); // ✅ add this

  fetch("/api/socket").catch(() => {
    console.warn("Failed to boot socket server");
  });

  socket = io({
    path: "/api/socket",
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.debug("✅ socket connected", socket?.id);

    const s = socket;  // narrow scope for type safety
    if (s) {
      s.emit("join", meEmail);
      console.debug("📥 joined room", meEmail);
    }
  });

  socket.on("connect_error", (err) => {
    console.error("❌ connect_error", err);
  });

  return socket;
}
