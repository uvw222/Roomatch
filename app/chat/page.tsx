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
  MapPin,
  Calendar,
  Users,
  Clock,
  Bell,
  ChevronDown,
  ChevronUp
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

/* ---------- Enhanced Chat Page ---------- */

export default function ChatPage() {
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
        // Check if this message is for the current conversation
        if (
          (message.from === selectedUser?.email && message.to === profile.email) ||
          (message.from === profile.email && message.to === selectedUser?.email)
        ) {
          setMessages(prev => [...prev, message]);
          // Update unread count in matched users list
          updateUnreadCount(message.from, 1);
        }
        
        // Check if this is a new message from any user (for header notification)
        if (message.to === profile.email && message.from !== selectedUser?.email) {
          setHasNewMessages(true);
          
          // Update the matched users list to reflect the new message
          setMatchedUsers(prev => {
            const updatedUsers = prev.map(user => 
              user.email === message.from 
                ? { 
                    ...user, 
                    lastMessage: message.text,
                    lastTime: new Date(message.timestamp),
                    time: new Date(message.timestamp).toLocaleString()
                  }
                : user
            );
            
            // Sort users by last message time (most recent first)
            return sortUsersByLastMessage(updatedUsers);
          });
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
        // Sort users by last message time (most recent first)
        const sortedMatches = sortUsersByLastMessage(data.matches);
        setMatchedUsers(sortedMatches);
        
        // Check if there are any unread messages for header notification
        const hasUnread = sortedMatches.some((user: MatchedUser) => user.unread > 0);
        setHasNewMessages(hasUnread);
        
        // If there's an initial user from URL params, select them
        if (initialUserEmail && sortedMatches.length > 0) {
          const initialUser = sortedMatches.find((user: MatchedUser) => user.email === initialUserEmail);
          if (initialUser) {
            setSelectedUser(initialUser);
            fetchMessages(initialUser.email);
          }
        } else if (sortedMatches.length > 0) {
          // Select first user by default (which will be the most recent)
          setSelectedUser(sortedMatches[0]);
          fetchMessages(sortedMatches[0].email);
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
          
          // Update unread count in matched users list
          updateUnreadCount(userEmail, -unreadIds.length);
          
          // Refresh global unread count
          refreshUnreadCount();
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Update unread count for a user and maintain sorting by last message time
  const updateUnreadCount = (userEmail: string, change: number) => {
    setMatchedUsers(prev => {
      const updatedUsers = prev.map(user => 
        user.email === userEmail 
          ? { ...user, unread: Math.max(0, user.unread + change) }
          : user
      );
      
      // Update header notification - only show if there are any unread messages
      const hasUnread = updatedUsers.some(user => user.unread > 0);
      setHasNewMessages(hasUnread);
      
      // Maintain sorting by last message time
      return sortUsersByLastMessage(updatedUsers);
    });
  };

  // Sort matched users by last message time (most recent first)
  const sortUsersByLastMessage = (users: MatchedUser[]) => {
    return [...users].sort((a, b) => {
      const timeA = new Date(a.lastTime).getTime();
      const timeB = new Date(b.lastTime).getTime();
      return timeB - timeA; // Descending order (newest first)
    });
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
        
        // Update last message in matched users list and maintain sorting
        setMatchedUsers(prev => {
          const updatedUsers = prev.map(user => 
            user.email === selectedUser.email 
              ? { 
                  ...user, 
                  lastMessage: newMessage.trim(),
                  lastTime: new Date(),
                  time: new Date().toLocaleString()
                }
              : user
          );
          
          // Sort users by last message time (most recent first)
          return sortUsersByLastMessage(updatedUsers);
        });
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

  // Refresh chat list and maintain sorting
  const refreshChatList = async () => {
    await fetchMatchedUsers();
  };

  // Periodic refresh to ensure chat list stays sorted (every 30 seconds)
  useEffect(() => {
    if (profile?.email) {
      const interval = setInterval(() => {
        refreshChatList();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [profile?.email]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full pt-safe pb-safe">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
            <div className="flex flex-col h-[70vh] sm:h-[80vh] md:h-[90vh] pt-safe pb-safe">
      <div className="w-full md:w-[1000px] mx-auto px-2 sm:px-4 lg:px-8 flex-1 flex flex-col min-h-0">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-slate-200 bg-white/80 backdrop-blur-sm rounded-t-lg flex-shrink-0">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                RooChat
              </h1>
              {hasNewMessages && (
                <div className="relative">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-orange-500" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 bg-red-500 rounded-full"></div>
                </div>
              )}
            </div>
            <p className="text-slate-600 text-xs sm:text-sm">Chat with your matches</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">Online</span>
          </div>
        </div>

        <div className="chat-container bg-white/80 backdrop-blur-sm border-0 rounded-b-lg shadow-xl flex flex-col md:grid md:grid-cols-[300px_1fr] flex-1 min-h-0 overflow-hidden">
          {/* -------- Enhanced Matched Users List -------- */}
          <div className="border-b md:border-b-0 md:border-r border-slate-200 bg-white/80 backdrop-blur-sm flex flex-col min-h-0">
            {/* Mobile User List Dropdown Header */}
            <div className="md:hidden p-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                  {selectedUser ? (
                    <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 text-xs">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-xs">
                    {selectedUser ? selectedUser.name : "Select a match"}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {selectedUser ? "Tap to change" : "Choose someone to chat with"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileUserListOpen(!isMobileUserListOpen)}
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-slate-100"
              >
                {isMobileUserListOpen ? (
                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                ) : (
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                )}
              </Button>
            </div>

            {/* Mobile User List Dropdown */}
            <div className={`md:hidden ${isMobileUserListOpen ? 'block' : 'hidden'} border-b border-slate-200 bg-white/80 backdrop-blur-sm`}>
              <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search your matches..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 h-9"
                  />
                </div>
              </div>
              
              <ScrollArea className="max-h-64 users-list-scroll">
                <div className="p-2">
                  {matchedUsers.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-5 w-5 text-orange-500" />
                      </div>
                      <h3 className="text-xs font-semibold text-slate-800 mb-1">No matches yet</h3>
                      <p className="text-xs text-slate-600 mb-2">Start swiping to find potential roommates</p>
                      <Button 
                        onClick={() => router.push('/match')}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs h-7"
                      >
                        Go to Matches
                      </Button>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => {
                          handleUserSelect(user);
                          setIsMobileUserListOpen(false);
                        }}
                        className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50 transition-all duration-200 rounded-lg mb-1 ${
                          selectedUser?._id === user._id ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200" : ""
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImage} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.unread > 0 && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs flex items-center justify-center font-semibold shadow-lg">
                              {user.unread}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-800 truncate text-xs">{user.name}</h3>
                            <span className="text-xs text-slate-500 font-medium">{user.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-1">{user.lastMessage}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Desktop User List */}
            <div className="hidden md:block">
              <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search your matches..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 h-9"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1 min-h-0 users-list-scroll">
                <div className="p-2">
                  {matchedUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-orange-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-2">No matches yet</h3>
                      <p className="text-xs text-slate-600 mb-3">Start swiping to find potential roommates</p>
                      <Button 
                        onClick={() => router.push('/match')}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs h-8"
                      >
                        Go to Matches
                      </Button>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleUserSelect(user)}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-all duration-200 rounded-lg mb-1 ${
                          selectedUser?._id === user._id ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200" : ""
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImage} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {user.unread > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs flex items-center justify-center font-semibold shadow-lg">
                              {user.unread}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-800 truncate text-sm">{user.name}</h3>
                            <span className="text-xs text-slate-500 font-medium">{user.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-1">{user.lastMessage}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* -------- Enhanced Conversation -------- */}
          {selectedUser ? (
            <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm min-h-0 md:min-h-0">
              {/* Row 1: Conversation Header */}
              <div className="p-2 sm:p-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10">
                    <AvatarImage src={selectedUser.profileImage} alt={selectedUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 text-xs sm:text-sm">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-slate-800 text-xs sm:text-sm">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-slate-600">Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 p-0 hover:bg-slate-100"
                    onClick={() => router.push(`/profile/${selectedUser.name}`)}
                  >
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Row 2: Messages Area - Fixed height with scroll */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto p-2 sm:p-4 messages-container">
                  <div className="space-y-2 sm:space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1 sm:mb-2">Start a conversation</h3>
                        <p className="text-xs text-slate-600">Send a message to begin chatting with {selectedUser.name}</p>
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
                              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-2 sm:p-3 shadow-sm ${
                                isMyMessage
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                  : "bg-white border border-slate-200 text-slate-800"
                              }`}
                            >
                              <p className="leading-relaxed text-xs sm:text-sm">{message.text}</p>
                              <div className={`flex items-center justify-between mt-1.5 sm:mt-2 ${
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
                </div>
              </div>

              {/* Row 3: Compose box */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex-shrink-0">
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
                    className="flex-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all duration-200 h-10 sm:h-11 text-sm"
                  />
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0" 
                    type="submit"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">No conversation selected</h2>
                <p className="text-xs sm:text-sm text-slate-600">Choose a match to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
