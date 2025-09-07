"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  User,
  Search,
  Heart,
  MessageCircle,
  Users,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { getSocketClient } from "@/lib/socketClient";

/* ---------- Types ---------- */
type MatchedUser = {
  _id: string;
  email: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  lastTime: Date;
  unread: number;
  time: string;
};

type Message = {
  _id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
  read: boolean;
};

/* ---------- Inner Chat Page ---------- */
export default function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { profile } = useProfile();
  const { refreshUnreadCount } = useUnreadMessages();

  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MatchedUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isMobileUserListOpen, setIsMobileUserListOpen] = useState(false);

  // Get initial user from URL params
  const initialUserEmail = searchParams?.get("other");

  // Auto-scroll on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Socket init
  useEffect(() => {
    if (profile?.email) {
      const socketClient = getSocketClient(profile.email);
      setSocket(socketClient);

      const handleNewMessage = (message: Message) => {
        if (
          (message.from === selectedUser?.email && message.to === profile.email) ||
          (message.from === profile.email && message.to === selectedUser?.email)
        ) {
          setMessages((prev) => [...prev, message]);
          updateUnreadCount(message.from, 1);
        }
        if (message.to === profile.email && message.from !== selectedUser?.email) {
          setHasNewMessages(true);
          setMatchedUsers((prev) => {
            const updated = prev.map((user) =>
              user.email === message.from
                ? {
                    ...user,
                    lastMessage: message.text,
                    lastTime: new Date(message.timestamp),
                    time: new Date(message.timestamp).toLocaleString(),
                  }
                : user
            );
            return sortUsersByLastMessage(updated);
          });
        }
      };

      const handleReadReceipt = () => {
        fetchMessages(selectedUser?.email || "");
      };

      socketClient.on("messages:new", handleNewMessage);
      socketClient.on("messages:read", handleReadReceipt);

      return () => {
        socketClient.off("messages:new", handleNewMessage);
        socketClient.off("messages:read", handleReadReceipt);
      };
    }
  }, [profile?.email, selectedUser?.email]);

  // Fetch users
  const fetchMatchedUsers = async () => {
    try {
      const res = await fetch("/api/chat/matches", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const sorted = sortUsersByLastMessage(data.matches);
        setMatchedUsers(sorted);
        setHasNewMessages(sorted.some((u: MatchedUser) => u.unread > 0));

        if (initialUserEmail && sorted.length > 0) {
          const initialUser = sorted.find((u: MatchedUser) => u.email === initialUserEmail);
          if (initialUser) {
            setSelectedUser(initialUser);
            fetchMessages(initialUser.email);
          }
        } else if (sorted.length > 0) {
          setSelectedUser(sorted[0]);
          fetchMessages(sorted[0].email);
        }
      }
    } catch (e) {
      console.error("Error fetching matched users:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (userEmail: string) => {
    if (!userEmail) return;
    try {
      const res = await fetch(
        `/api/messages/list?mode=conversation&other=${encodeURIComponent(userEmail)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);

        const unreadIds = data.messages
          .filter((m: Message) => !m.read && m.to === profile?.email)
          .map((m: Message) => m._id);
        if (unreadIds.length > 0) {
          await fetch("/api/messages/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageIds: unreadIds }),
            credentials: "include",
          });
          updateUnreadCount(userEmail, -unreadIds.length);
          refreshUnreadCount();
        }
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  };

  const updateUnreadCount = (email: string, change: number) => {
    setMatchedUsers((prev) => {
      const updated = prev.map((u) =>
        u.email === email ? { ...u, unread: Math.max(0, u.unread + change) } : u
      );
      setHasNewMessages(updated.some((u) => u.unread > 0));
      return sortUsersByLastMessage(updated);
    });
  };

  const sortUsersByLastMessage = (users: MatchedUser[]) =>
    [...users].sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

  const handleUserSelect = async (u: MatchedUser) => {
    setSelectedUser(u);
    await fetchMessages(u.email);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !profile?.email) return;
    const msg = { to: selectedUser.email, text: newMessage.trim() };

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
        credentials: "include",
      });
      if (res.ok) {
        const newMsg: Message = {
          _id: Date.now().toString(),
          from: profile.email,
          to: selectedUser.email,
          text: newMessage.trim(),
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        setMatchedUsers((prev) =>
          sortUsersByLastMessage(
            prev.map((u) =>
              u.email === selectedUser.email
                ? {
                    ...u,
                    lastMessage: newMessage.trim(),
                    lastTime: new Date(),
                    time: new Date().toLocaleString(),
                  }
                : u
            )
          )
        );
      }
    } catch (e) {
      console.error("Error sending message:", e);
    }
  };

  const filteredUsers = matchedUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchMatchedUsers();
  }, [profile?.email]);

  useEffect(() => {
    if (profile?.email) {
      const interval = setInterval(fetchMatchedUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [profile?.email]);

  /* ---- Render ---- */
  if (isLoading) return <div>Loading your matches...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-2 sm:p-4">
      {/* Left: matches list */}
      <div className="w-72 shrink-0 hidden md:flex flex-col border rounded-lg">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 flex flex-col gap-1">
            {filteredUsers.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">
                No matches yet
              </div>
            )}
            {filteredUsers.map((u) => (
              <button
                key={u.email}
                onClick={() => handleUserSelect(u)}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition ${
                  selectedUser?.email === u.email ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.profileImage} alt={u.name} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{u.name || u.email}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{u.time}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{u.lastMessage}</div>
                  </div>
                  {u.unread > 0 && <Badge className="ml-auto">{u.unread}</Badge>}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: conversation */}
      <div className="flex-1 flex flex-col border rounded-lg">
        <div className="p-3 border-b flex items-center gap-3">
          {selectedUser ? (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium truncate">{selectedUser.name || selectedUser.email}</div>
                <div className="text-xs text-muted-foreground truncate">{selectedUser.email}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Select a match to start chatting</div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {!selectedUser && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Pick someone from the list to view messages
              </div>
            )}
            {selectedUser &&
              messages.map((m) => {
                const mine = m.from === profile?.email;
                return (
                  <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <Card className={`max-w-[75%] ${mine ? "bg-primary text-primary-foreground" : ""}`}>
                      <CardContent className="p-3">
                        <div className="whitespace-pre-wrap break-words text-sm">{m.text}</div>
                        <div
                          className={`mt-1 text-[10px] opacity-70 ${
                            mine ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(m.timestamp).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder={selectedUser ? "Type a message..." : "Select a user to start"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!selectedUser}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <Button onClick={handleSendMessage} disabled={!selectedUser || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
