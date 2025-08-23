// app/chat/page.tsx
"use client";

import { useRef } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Search, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import InitSocket from "@/components/InitSocket"; // ✅ ADDED
import { useProfile } from "../../hooks/useProfile";


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
  const { profile } = useProfile();
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
      if (!profile?.email) return;

      const list = await fetchContacts();
      setContacts(list);

      if (list.length) {
        setSelectedContact(list[0]);
        setMessages(await fetchConversation(list[0].email));
      }
    };
    init();
  }, [profile?.email]);

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact);
    const msgs = await fetchConversation(contact.email);
    setMessages(msgs);

    const unreadIds = msgs
      .filter((m) => !m.read && m.to === profile?.email)
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
    <div className="flex flex-col h-full pt-safe pb-safe bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ✅ Added socket init */}
      {profile?.email && <InitSocket email={profile.email} />}

      <div className="container px-4 py-4 flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              RooChat
            </h1>
            <p className="text-slate-600">Connect with your potential roommates</p>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Online</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-[350px_1fr] flex-1 overflow-hidden">
          {/* -------- Enhanced Contacts list -------- */}
          <div className="border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(var(--app-height)-280px)] md:h-[calc(var(--app-height)-280px)]">
              {contacts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No conversations yet</h3>
                  <p className="text-slate-600">Start matching to begin chatting</p>
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleContactSelect(c)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-all duration-200 ${
                      selectedContact?._id === c._id ? "bg-gradient-to-r from-orange-50 to-red-50 border-r-2 border-orange-500" : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={c.image || "/placeholder.svg"}
                        alt={c.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-slate-200"
                      />
                      {c.unread > 0 && (
                        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs flex items-center justify-center font-semibold shadow-lg">
                          {c.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-slate-800 truncate">{c.name}</h3>
                        <span className="text-xs text-slate-500 font-medium">{c.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate mt-1">{c.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* -------- Enhanced Conversation -------- */}
          {selectedContact ? (
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedContact.image || "/placeholder.svg"}
                    className="h-12 w-12 rounded-full object-cover border-2 border-slate-200"
                    alt={selectedContact.name}
                  />
                  <div>
                    <h2 className="font-semibold text-slate-800">{selectedContact.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-slate-600">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-slate-100">
                    <Phone className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-slate-100">
                    <Video className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Message list */}
              <ScrollArea className="flex-1 p-6 chat-content-area">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">Start a conversation</h3>
                      <p className="text-slate-600">Send a message to begin chatting with {selectedContact.name}</p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMyMessage = m.from?.toLowerCase() === profile?.email?.toLowerCase();
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                          ref={idx === messages.length - 1 ? bottomRef : null}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                              isMyMessage
                                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          >
                            <p className="leading-relaxed">{m.text}</p>
                            <p className={`text-xs mt-2 ${isMyMessage ? "text-orange-100" : "text-slate-500"}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Enhanced Compose box */}
              <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-3"
                >
                  <Input
                    value={newMessage}
                    placeholder="Type a message…"
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                  />
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                    type="submit"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">No conversation selected</h2>
                <p className="text-slate-600">Choose a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
