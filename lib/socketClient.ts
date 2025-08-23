import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocketClient(meEmail: string) {
  if (socket) return socket;
  console.log("[getSocketClient] Connecting socket..."); // ✅ add this

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/socket`).catch(() => {
    console.warn("Failed to boot socket server");
  });

  socket = io({
    path: "/api/socket",
    transports: ["websocket", "polling"], // Add polling as fallback
    timeout: 60000, // 60 seconds timeout
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    forceNew: false,
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

  socket.on("disconnect", (reason) => {
    console.warn("🔌 socket disconnected:", reason);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 socket reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_error", (err) => {
    console.error("❌ reconnect_error", err);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ reconnection failed - max attempts reached");
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log("[disconnectSocket] Cleaning up socket connection");
    socket.disconnect();
    socket = null;
  }
}

export function getSocketStatus() {
  return {
    connected: socket?.connected || false,
    id: socket?.id || null,
  };
}
