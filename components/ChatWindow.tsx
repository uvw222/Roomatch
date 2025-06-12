"use client";

import { useConversation } from "@/hooks/useConversation";
import { useEffect } from "react";
import { cn } from "@/lib/utils"; // if you're using classnames utility (optional)

export default function ChatWindow({
  meEmail,
  otherEmail,
}: {
  meEmail: string;
  otherEmail: string;
}) {
  const { messages, mutate } = useConversation(meEmail, otherEmail);

  // Mark incoming messages as read
  useEffect(() => {
    if (messages?.some((m: any) => m.to === meEmail && !m.read)) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/mark-read`, {
        method: "POST",
        body: JSON.stringify({ other: otherEmail }),
        headers: { "Content-Type": "application/json" },
      }).then(() => mutate());
    }
  }, [messages, meEmail, otherEmail, mutate]);

  return (
    <div className="max-h-[60vh] overflow-y-auto px-2 flex flex-col gap-2">
      {messages?.map((m: any) => {
        const isOwn = m.from === meEmail;
        return (
          <div
            key={m._id}
            className={cn(
              "max-w-[75%] px-4 py-2 rounded-lg break-words",
              isOwn
                ? "self-end bg-orange-500 text-white text-right"
                : "self-start bg-gray-200 text-gray-800 text-left"
            )}
          >
            {m.text}
          </div>
        );
      })}
    </div>
  );
}
