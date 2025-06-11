// components/InitSocket.tsx
"use client";

import { useEffect } from "react";
import { getSocketClient } from "@/lib/socketClient";

export default function InitSocket({ email }: { email: string }) {
  useEffect(() => {
        console.log("[InitSocket] Booting socket for", email); // ✅ add this line
    if (email) getSocketClient(email);
  }, [email]);

  return null;
}
