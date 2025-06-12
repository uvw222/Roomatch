// app/chat/page.tsx
"use client";

import { useRef } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from "lucide-react";
import InitSocket from "@/components/InitSocket"; // ✅ ADDED


/* ---------- Types ---------- */

type Contact = {
  _id: string; // MongoDB id of the OTHER user
  email: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  image: string;
};

type ServerMessage = {
  _id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
  read: boolean;
};

/* ---------- Helper fetchers ---------- */

async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/list?mode=contacts`);
  const data = await res.json();
  return data.success ? (data.contacts as Contact[]) : [];
}

async function fetchConversation(otherEmail: string): Promise<ServerMessage[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/list?mode=conversation&other=${encodeURIComponent(otherEmail)}`);
  const data = await res.json();
  return data.success ? (data.messages as ServerMessage[]) : [];
}

/* ---------- Chat Page ---------- */

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [myEmail, setMyEmail] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

useEffect(() => {
  if (bottomRef.current) {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`);
      const meData = await meRes.json();
      if (!meData.success) return;
      setMyEmail(meData.profile.email);

      const list = await fetchContacts();
      setContacts(list);

      if (list.length) {
        setSelectedContact(list[0]);
        setMessages(await fetchConversation(list[0].email));
      }
    };
    init();
  }, []);

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact);
    const msgs = await fetchConversation(contact.email);
    setMessages(msgs);

    const unreadIds = msgs
      .filter((m) => !m.read && m.to === myEmail)
      .map((m) => m._id);

    if (unreadIds.length) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds: unreadIds }),
      });
      setContacts(await fetchContacts());
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: selectedContact.email,
        text: newMessage.trim(),
      }),
    });

    setMessages(await fetchConversation(selectedContact.email));
    setContacts(await fetchContacts());
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full pt-safe pb-safe">
      {/* ✅ Added socket init */}
      {myEmail && <InitSocket email={myEmail} />}

      <div className="container px-4 py-4 flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-4">RooChat</h1>

        <div className="border rounded-lg grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
          {/* -------- Contacts list -------- */}
          <div className="border-r">
            <div className="p-3 border-b">
              <Input placeholder="Search conversations..." />
            </div>
            <ScrollArea className="h-[calc(var(--app-height)-220px)] md:h-[calc(var(--app-height)-220px)]">
              {contacts.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleContactSelect(c)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    selectedContact?._id === c._id ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={c.image || "/placeholder.svg"}
                      alt={c.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {c.unread > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center">
                        {c.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate">{c.name}</h3>
                      <span className="text-xs text-gray-500">{c.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{c.lastMessage}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* -------- Conversation -------- */}
          {selectedContact ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-3 border-b flex items-center gap-3">
                <img
                  src={selectedContact.image || "/placeholder.svg"}
                  className="h-10 w-10 rounded-full object-cover"
                  alt={selectedContact.name}
                />
                <div>
                  <h2 className="font-medium">{selectedContact.name}</h2>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>

              {/* Message list */}
              <ScrollArea className="flex-1 p-4 chat-content-area">
                <div className="space-y-4">
                  {messages.map((m, idx) => (
  <div
    key={m._id}
    className={`flex ${m.from === myEmail ? "justify-end" : "justify-start"}`}
    ref={idx === messages.length - 1 ? bottomRef : null}
  >
    <div
      className={`max-w-[70%] rounded-lg p-3 ${
        m.from === myEmail ? "bg-orange-600 text-white" : "bg-gray-100 dark:bg-gray-800"
      }`}
    >
      <p>{m.text}</p>
      <p className={`text-xs mt-1 ${
        m.from === myEmail ? "text-orange-100" : "text-gray-500"
      }`}>
        {new Date(m.timestamp).toLocaleTimeString()}
      </p>
    </div>
  </div>
))}

                </div>
              </ScrollArea>

              {/* Compose box */}
              <div className="p-3 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newMessage}
                    placeholder="Type a message…"
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button className="bg-orange-600 hover:bg-orange-700" type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <h2 className="text-xl font-medium">No conversation selected</h2>
                <p className="text-gray-500">Choose a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
