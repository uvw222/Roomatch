"use client";

import { useConversation } from "@/hooks/useConversation";
import { useEffect, useRef, useState } from "react";
import { getSocketClient } from "@/lib/socketClient";

export default function ChatWindow({
  meEmail,
  otherEmail,
}: {
  meEmail: string;
  otherEmail: string;
}) {
  const { messages: initialMessages, mutate } = useConversation(meEmail, otherEmail);
  const [messages, setMessages] = useState(initialMessages || []);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ Live update messages via socket
  useEffect(() => {
    const socket = getSocketClient(meEmail);

    socket.on("message", (msg: any) => {
      if (
        (msg.from === otherEmail && msg.to === meEmail) || // incoming
        (msg.from === meEmail && msg.to === otherEmail)    // just sent
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [meEmail, otherEmail]);

  // ✅ Mark partner messages as read
  useEffect(() => {
    if (messages?.some((m: any) => m.to === meEmail && !m.read)) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/mark-read`, {
        method: "POST",
        body: JSON.stringify({ other: otherEmail }),
        headers: { "Content-Type": "application/json" },
      }).then(() => mutate());
    }
  }, [messages, meEmail, otherEmail, mutate]);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-h-[60vh] overflow-y-auto px-2 flex flex-col gap-3">
      {messages?.map((m: any) => {
        const isOwn = m.from === meEmail;
        return (
          <div
            key={m._id}
            className={`max-w-[75%] px-4 py-2 rounded-lg break-words ${
              isOwn
                ? "self-end bg-orange-500 text-white text-right"
                : "self-start bg-gray-200 text-gray-800 text-left"
            }`}
          >
            <div className="text-sm">{m.text}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              {isOwn && m.read ? "✓ Seen" : ""}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
