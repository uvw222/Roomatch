"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, User } from "lucide-react"

type Contact = {
  id: number
  name: string
  lastMessage: string
  time: string
  unread: number
  image: string
}

type Message = {
  id: number
  senderId: number
  text: string
  time: string
}

const contacts: Contact[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    lastMessage: "When can we meet to see the apartment?",
    time: "10:30 AM",
    unread: 2,
    image: "/placeholder.svg?height=40&width=40&text=SJ",
  },
  {
    id: 2,
    name: "Michael Brown",
    lastMessage: "I think we'd be great roommates!",
    time: "Yesterday",
    unread: 0,
    image: "/placeholder.svg?height=40&width=40&text=MB",
  },
  {
    id: 3,
    name: "Emily Davis",
    lastMessage: "What's your budget range?",
    time: "Yesterday",
    unread: 0,
    image: "/placeholder.svg?height=40&width=40&text=ED",
  },
  {
    id: 4,
    name: "David Wilson",
    lastMessage: "Are pets allowed in your apartment?",
    time: "Monday",
    unread: 0,
    image: "/placeholder.svg?height=40&width=40&text=DW",
  },
  {
    id: 5,
    name: "Jessica Martinez",
    lastMessage: "I'm looking for a place starting next month",
    time: "Sunday",
    unread: 0,
    image: "/placeholder.svg?height=40&width=40&text=JM",
  },
]

const messagesByContact: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      text: "Hi there! I saw your profile and I think we might be compatible roommates.",
      time: "10:15 AM",
    },
    { id: 2, senderId: 0, text: "Hello! Thanks for reaching out. I'd love to chat more about it.", time: "10:20 AM" },
    {
      id: 3,
      senderId: 1,
      text: "Great! I'm looking for a place in the downtown area. Is that where your apartment is located?",
      time: "10:22 AM",
    },
    {
      id: 4,
      senderId: 0,
      text: "Yes, it's right in the heart of downtown, close to public transportation and lots of restaurants.",
      time: "10:25 AM",
    },
    { id: 5, senderId: 1, text: "That sounds perfect! When can we meet to see the apartment?", time: "10:30 AM" },
  ],
  2: [
    { id: 1, senderId: 2, text: "Hey, I noticed we have similar living preferences!", time: "Yesterday" },
    {
      id: 2,
      senderId: 0,
      text: "Hi Michael! Yes, I noticed that too. What part of town are you looking in?",
      time: "Yesterday",
    },
    { id: 3, senderId: 2, text: "I'm flexible, but prefer the west side. How about you?", time: "Yesterday" },
    {
      id: 4,
      senderId: 0,
      text: "I'm currently in a 2-bedroom on the west side actually, looking for a roommate.",
      time: "Yesterday",
    },
    { id: 5, senderId: 2, text: "I think we'd be great roommates!", time: "Yesterday" },
  ],
}

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0])
  const [messages, setMessages] = useState<Message[]>(messagesByContact[contacts[0].id] || [])
  const [newMessage, setNewMessage] = useState("")

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
    setMessages(messagesByContact[contact.id] || [])

    // Mark as read
    const updatedContacts = contacts.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const newMsg: Message = {
      id: messages.length + 1,
      senderId: 0, // Current user
      text: newMessage,
      time: "Just now",
    }

    setMessages([...messages, newMsg])

    // Update in the record
    if (selectedContact) {
      messagesByContact[selectedContact.id] = [...(messagesByContact[selectedContact.id] || []), newMsg]
    }

    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-full pt-safe pb-safe">
      <div className="container px-4 py-4 flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-4">RooChat</h1>

        <div className="border rounded-lg grid grid-cols-1 md:grid-cols-[300px_1fr] flex-1">
          {/* Contacts List */}
          <div className="border-r">
            <div className="p-3 border-b">
              <Input placeholder="Search conversations..." />
            </div>
            <ScrollArea className="h-[calc(var(--app-height)-220px)] md:h-[calc(var(--app-height)-220px)]">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    selectedContact?.id === contact.id ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <img
                        src={contact.image || "/placeholder.svg"}
                        alt={contact.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {contact.unread > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center">
                        {contact.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate">{contact.name}</h3>
                      <span className="text-xs text-gray-500">{contact.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          {selectedContact ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={selectedContact.image || "/placeholder.svg"}
                    alt={selectedContact.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-medium">{selectedContact.name}</h2>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 chat-content-area">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 0 ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === 0 ? "bg-orange-600 text-white" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 ${message.senderId === 0 ? "text-orange-100" : "text-gray-500"}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                >
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
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
  )
}
