import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Send, Image, Users, MessageSquare, Share2 } from "lucide-react";

export default function ChatInterface() {
  const [messages, setMessages] = React.useState([
    { id: 1, sender: "John", content: "Hey there!", timestamp: "10:00 AM" },
    {
      id: 2,
      sender: "Alice",
      content: "Hi John! How are you?",
      timestamp: "10:02 AM",
    },
    {
      id: 3,
      sender: "John",
      content: "I'm doing great, thanks for asking!",
      timestamp: "10:05 AM",
    },
    {
      id: 4,
      sender: "Alice",
      content: "Check out this image!",
      timestamp: "10:10 AM",
      image: "/placeholder.svg?height=200&width=200",
    },
  ]);
  const [newMessage, setNewMessage] = React.useState("");
  const [selectedContact, setSelectedContact] = React.useState("Alice");
  const [mobileView, setMobileView] = React.useState<
    "contacts" | "chat" | "media"
  >("chat");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "John",
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "John",
          content: "Sent an image",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: "/placeholder.svg?height=200&width=200",
        },
      ]);
    }
  };

  const sharedMedia = messages.filter((message) => message.image);

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="flex flex-col lg:flex-row h-full gap-4">
        {/* Mobile Navigation */}
        <div className="flex lg:hidden mb-4 border rounded-lg overflow-hidden">
          <Button
            variant={mobileView === "contacts" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setMobileView("contacts")}
          >
            <Users className="h-5 w-5 mr-2" />
            Contacts
          </Button>
          <Button
            variant={mobileView === "chat" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setMobileView("chat")}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Chat
          </Button>
          <Button
            variant={mobileView === "media" ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setMobileView("media")}
          >
            <Share2 className="h-5 w-5 mr-2" />
            Media
          </Button>
        </div>

        {/* Contacts */}
        <Card
          className={`w-full lg:w-64 h-full ${
            mobileView === "contacts" ? "block" : "hidden"
          } lg:block`}
        >
          <CardHeader>
            <h2 className="text-xl font-bold">Contacts</h2>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-4">
                {["John", "Alice"].map((contact) => (
                  <HoverCard key={contact}>
                    <HoverCardTrigger asChild>
                      <div
                        className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer transition-colors duration-200 
                          ${
                            selectedContact === contact
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary"
                          }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder-avatar${
                              contact === "Alice" ? "-2" : ""
                            }.jpg`}
                            alt={contact}
                          />
                          <AvatarFallback>{contact[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{contact}</p>
                          <p className="text-xs text-gray-500">
                            {contact === "John" ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder-avatar${
                              contact === "Alice" ? "-2" : ""
                            }.jpg`}
                          />
                          <AvatarFallback>{contact[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">{contact}</h4>
                          <p className="text-sm">
                            {contact === "John"
                              ? "Your account"
                              : "Last seen: 2 hours ago"}
                          </p>
                          <div className="flex items-center pt-2">
                            <Button variant="outline" className="text-xs">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card
          className={`flex-1 flex flex-col h-full ${
            mobileView === "chat" ? "block" : "hidden"
          } lg:block`}
        >
          <CardHeader>
            <h1 className="text-2xl font-bold">Chat with {selectedContact}</h1>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)]">
              <div className="space-y-4 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "John"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "John"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {message.image && (
                        <img
                          src={message.image || "/placeholder.svg"}
                          alt="Shared"
                          className="mb-2 rounded-lg"
                        />
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full space-x-2"
            >
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Image className="h-4 w-4" />
                <span className="sr-only">Upload image</span>
              </Button>
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Shared Media */}
        <Card
          className={`w-full lg:w-64 h-full ${
            mobileView === "media" ? "block" : "hidden"
          } lg:block`}
        >
          <CardHeader>
            <h2 className="text-xl font-bold">Shared Media</h2>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="grid grid-cols-2 gap-2">
                {sharedMedia.map((media, index) => (
                  <img
                    key={index}
                    src={media.image || "/placeholder.svg"}
                    alt={`Shared media ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
