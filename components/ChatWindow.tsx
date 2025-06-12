// components/ChatWindow.tsx
import { useConversation } from "@/hooks/useConversation";
import { useEffect } from "react";

export default function ChatWindow({
  meEmail,
  otherEmail,
}: {
  meEmail: string;
  otherEmail: string;
}) {
  const { messages, mutate } = useConversation(meEmail, otherEmail);

  /* mark partner’s messages read */
  useEffect(() => {
    if (messages.some((m: any) => m.to === meEmail && !m.read)) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/mark-read`, {
        method: "POST",
        body: JSON.stringify({ other: otherEmail }),
      }).then(() => mutate());
    }
  }, [messages, meEmail, otherEmail, mutate]);
  return (
  <div className="max-h-[60vh] overflow-y-auto px-2 flex flex-col gap-1">
    {messages.map((m: any) => (
      <div
        key={m._id}
        className={`max-w-[70%] px-4 py-2 rounded-lg text-white break-words ${
          m.from === meEmail
            ? "bg-orange-500 self-end text-right"
            : "bg-gray-400 self-start text-left"
        }`}
      >
        {m.text}
      </div>
    ))}
  </div>
);

}
