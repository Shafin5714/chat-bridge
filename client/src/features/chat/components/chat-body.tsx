import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image } from "lucide-react";
import { useAppSelector } from "@/store";

type Props = {
  mobileView: string;
};

export default function Chat({ mobileView }: Props) {
  const { selectedUser } = useAppSelector((state) => state.user);
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

  return (
    <Card
      className={`flex h-full flex-1 flex-col ${
        mobileView === "chat" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader>
        <h1 className="text-2xl font-bold">Chat with {selectedUser?.name}</h1>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16.5rem)]">
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "John" ? "justify-end" : "justify-start"
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
                  <p className="mt-1 text-xs text-gray-400">
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
  );
}
