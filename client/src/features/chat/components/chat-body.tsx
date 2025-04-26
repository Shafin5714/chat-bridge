import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
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
import { Send, Image, X } from "lucide-react";
import { useAppSelector } from "@/store";
import { toast } from "sonner";
import { useSendMessageMutation } from "@/store/api/messageApi";

type Props = {
  mobileView: string;
};

export default function Chat({ mobileView }: Props) {
  // api
  const [sendMessage] = useSendMessageMutation();

  // states
  const [text, setText] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const { selectedUser } = useAppSelector((state) => state.user);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [messages] = React.useState([
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image")) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (): void => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const res = await sendMessage({
      senderId: selectedUser?._id as string,
      text,
      image: imagePreview as string,
    }).unwrap();

    console.log(res);
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
        <ScrollArea
          className={`h-[calc(100vh-20rem)] ${imagePreview ? "lg:max-h-[calc(100vh-20rem)]" : "lg:h-[calc(100vh-16.5rem)]"}`}
        >
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
      <CardFooter className="flex flex-col items-end p-2">
        <div className="w-full p-1">
          {imagePreview ? (
            <div className="relative max-h-16 w-16 rounded-sm border border-solid border-gray-400">
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-[-5px] top-[-5px] m-0 h-5 w-5 rounded-xl p-1"
                onClick={handleRemove}
              >
                <X />
              </Button>
              <img src={imagePreview as string} alt="image preview" />
            </div>
          ) : null}
        </div>
        <div className="w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(e);
            }}
            className="flex w-full space-x-2"
          >
            <Input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1"
            />

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Image />
              </Button>
            </div>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
}
