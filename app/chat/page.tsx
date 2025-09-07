"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ChatPageInner from "./ChatPageInner";

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
