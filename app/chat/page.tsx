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
  MoreVertical, 
  Phone, 
  Video, 
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Users,
  Clock
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { getSocketClient } from "@/lib/socketClient";

/* ---------- Types ---------- */

type MatchedUser = {
  _id: string;
  email: string;
  name: string;
  profileImage: string;
  userType: string;
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

/* ---------- Enhanced Chat Page ---------- */

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { profile } = useProfile();
  
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MatchedUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);

  // Get initial user from URL params (for navigation from chat buttons)
  const initialUserEmail = searchParams?.get('other');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    if (profile?.email) {
      const socketClient = getSocketClient(profile.email);
      setSocket(socketClient);

      // Listen for new messages
      const handleNewMessage = (message: Message) => {
        if (
          (message.from === selectedUser?.email && message.to === profile.email) ||
          (message.from === profile.email && message.to === selectedUser?.email)
        ) {
          setMessages(prev => [...prev, message]);
          // Update unread count in matched users list
          updateUnreadCount(message.from, 1);
        }
      };

      // Listen for read receipts
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

  // Fetch matched users
  const fetchMatchedUsers = async () => {
    try {
      const res = await fetch('/api/chat/matches', {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        setMatchedUsers(data.matches);
        
        // If there's an initial user from URL params, select them
        if (initialUserEmail && data.matches.length > 0) {
          const initialUser = data.matches.find((user: MatchedUser) => user.email === initialUserEmail);
          if (initialUser) {
            setSelectedUser(initialUser);
            fetchMessages(initialUser.email);
          }
        } else if (data.matches.length > 0) {
          // Select first user by default
          setSelectedUser(data.matches[0]);
          fetchMessages(data.matches[0].email);
        }
      }
    } catch (error) {
      console.error('Error fetching matched users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a specific user
  const fetchMessages = async (userEmail: string) => {
    if (!userEmail) return;
    
    try {
      const res = await fetch(`/api/messages/list?mode=conversation&other=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(data.messages);
        
        // Mark messages as read
        const unreadIds = data.messages
          .filter((m: Message) => !m.read && m.to === profile?.email)
          .map((m: Message) => m._id);

        if (unreadIds.length > 0) {
          await fetch('/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageIds: unreadIds }),
            credentials: 'include'
          });
          
          // Update unread count
          updateUnreadCount(userEmail, -unreadIds.length);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Update unread count for a user
  const updateUnreadCount = (userEmail: string, change: number) => {
    setMatchedUsers(prev => 
      prev.map(user => 
        user.email === userEmail 
          ? { ...user, unread: Math.max(0, user.unread + change) }
          : user
      )
    );
  };

  // Handle user selection
  const handleUserSelect = async (user: MatchedUser) => {
    setSelectedUser(user);
    await fetchMessages(user.email);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !profile?.email) return;

    const messageData = {
      to: selectedUser.email,
      text: newMessage.trim(),
    };

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        credentials: 'include'
      });

      if (res.ok) {
        // Add message to local state immediately for better UX
        const newMsg: Message = {
          _id: Date.now().toString(), // Temporary ID
          from: profile.email,
          to: selectedUser.email,
          text: newMessage.trim(),
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
        // Update last message in matched users list
        setMatchedUsers(prev => 
          prev.map(user => 
            user.email === selectedUser.email 
              ? { 
                  ...user, 
                  lastMessage: newMessage.trim(),
                  lastTime: new Date(),
                  time: new Date().toLocaleString()
                }
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Filter matched users based on search
  const filteredUsers = matchedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load data on mount
  useEffect(() => {
    fetchMatchedUsers();
  }, [profile?.email]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full pt-safe pb-safe bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-safe pb-safe bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              RooChat
            </h1>
            <p className="text-slate-600">Chat with your matches</p>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Online</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-[350px_1fr] flex-1 overflow-hidden">
          {/* -------- Enhanced Matched Users List -------- */}
          <div className="border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search your matches..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(var(--app-height)-280px)] md:h-[calc(var(--app-height)-280px)]">
              {matchedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No matches yet</h3>
                  <p className="text-slate-600 mb-4">Start swiping to find potential roommates</p>
                  <Button 
                    onClick={() => router.push('/match')}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    Go to Matches
                  </Button>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-all duration-200 ${
                      selectedUser?._id === user._id ? "bg-gradient-to-r from-orange-50 to-red-50 border-r-2 border-orange-500" : ""
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.unread > 0 && (
                        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs flex items-center justify-center font-semibold shadow-lg">
                          {user.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 truncate">{user.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {user.userType === 'renter' ? 'Looking' : 'Has Room'}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{user.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate mt-1">{user.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* -------- Enhanced Conversation -------- */}
          {selectedUser ? (
            <div className="flex flex-col h-full">
              {/* Enhanced Header */}
              <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-slate-800">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-slate-600">Online</p>
                      <Badge variant="secondary" className="text-xs">
                        {selectedUser.userType === 'renter' ? 'Looking for Room' : 'Has Room Available'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 hover:bg-slate-100"
                    onClick={() => router.push(`/profile/${selectedUser.email}`)}
                  >
                    <User className="h-4 w-4 text-slate-600" />
                  </Button>
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
                        <MessageCircle className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">Start a conversation</h3>
                      <p className="text-slate-600">Send a message to begin chatting with {selectedUser.name}</p>
                    </div>
                  ) : (
                    messages.map((message, idx) => {
                      const isMyMessage = message.from?.toLowerCase() === profile?.email?.toLowerCase();
                      return (
                        <div
                          key={message._id}
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
                            <p className="leading-relaxed">{message.text}</p>
                            <div className={`flex items-center justify-between mt-2 ${
                              isMyMessage ? "text-orange-100" : "text-slate-500"
                            }`}>
                              <span className="text-xs">
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {isMyMessage && (
                                <span className="text-xs">
                                  {message.read ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
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
                  <MessageCircle className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">No conversation selected</h2>
                <p className="text-slate-600">Choose a match to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
