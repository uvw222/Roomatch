// components/ChatWindow.tsx
import { useConversation } from "@/hooks/useConversation";
import { bubbleClasses } from "@/lib/bubbleClasses";
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
    <div className="flex flex-col gap-1">
      {messages.map((m: any) => (
        <div key={m._id} className={bubbleClasses(m.from === meEmail, m.read)}>
          {m.text}
        </div>
      ))}
    </div>
  );
}
