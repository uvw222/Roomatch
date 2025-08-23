// components/InitSocket.tsx
"use client";

import { useEffect } from "react";
import { getSocketClient, disconnectSocket } from "@/lib/socketClient";

export default function InitSocket({ email }: { email: string }) {
  useEffect(() => {
    console.log("[InitSocket] Booting socket for", email);
    if (email) {
      getSocketClient(email);
    }

    // Cleanup function - but don't disconnect on every unmount
    // as we want to keep the socket alive for real-time updates
    return () => {
      console.log("[InitSocket] Component unmounting for", email);
    };
  }, [email]);

  return null;
}
