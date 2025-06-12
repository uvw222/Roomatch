// components/ChatComposer.tsx
import { useState } from "react";

export default function ChatComposer({
  otherEmail,
}: {
  otherEmail: string;
}) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
      method: "POST",
      body: JSON.stringify({ to: otherEmail, text }),
    });

    setText(""); // socket will refresh list
  };

  return (
    <div className="flex gap-2 mt-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded-md px-3 py-1"
        placeholder="Type a message…"
      />
      <button
        onClick={handleSend}
        className="px-4 py-1 bg-blue-600 text-white rounded-md"
      >
        Send
      </button>
    </div>
  );
}
