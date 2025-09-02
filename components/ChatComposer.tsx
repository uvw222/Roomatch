import { useState } from "react";
import { getSocketClient } from "@/lib/socketClient";

export default function ChatComposer({
  meEmail,
  otherEmail,
}: {
  meEmail: string;
  otherEmail: string;
}) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    const socket = getSocketClient(meEmail);
    socket.emit("send", {
      from: meEmail,
      to: otherEmail,
      text,
      timestamp: new Date().toISOString(),
    });

    setText("");
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
