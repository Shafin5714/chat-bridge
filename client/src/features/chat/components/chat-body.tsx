import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
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
import { Send, Image, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toast } from "sonner";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
} from "@/store/api/messageApi";
import imageCompression from "browser-image-compression";
import { skipToken } from "@reduxjs/toolkit/query";
import { useSocketContext } from "@/contexts/socket-context";
import { messageSlice } from "@/store/slices";

type Props = {
  mobileView: string;
};

type Message = {
  _id: string;
  createdAt: string;
  image: string;
  receiverId: string;
  senderId: string;
  text: string;
  updatedAt: string;
};

export default function Chat({ mobileView }: Props) {
  // hooks
  const { socket } = useSocketContext();
  const dispatch = useAppDispatch();

  // states
  const [text, setText] = useState<string>("");
  const [newMessage, setNewMessage] = useState<Message>();
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const [typingData, setTypingData] = useState<{
    senderId: string;
    receiverId: string;
    isTyping: boolean;
  }>({
    senderId: "",
    receiverId: "",
    isTyping: false,
  });
  const [isTyping, setIsTyping] = useState(false);
  const { selectedUser } = useAppSelector((state) => state.user);
  const { messages } = useAppSelector((state) => state.message);
  const { userInfo } = useAppSelector((state) => state.auth);

  // api
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const userId = selectedUser?._id ?? skipToken;
  const { data } = useGetMessagesQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // scroll to bottom
  const msgEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // delay for message to load properly for scroll
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  }, [data, messages]);

  useEffect(() => {
    const handleNewMessage = (newMessage: Message) => {
      setNewMessage(newMessage);
    };

    socket?.on("newMessage", handleNewMessage);

    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    const isMessageSentFromSelectedUser = newMessage?.senderId === userId;
    if (isMessageSentFromSelectedUser) {
      dispatch(messageSlice.actions.setMessage(newMessage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  useEffect(() => {
    socket?.emit("typingMessage", {
      senderId: userInfo?.id,
      receiverId: userId,
      isTyping: text.length > 0 ? true : false,
    });
  }, [socket, text, userId, userInfo?.id]);

  useEffect(() => {
    const handleTypingMessage = (data: {
      senderId: string;
      receiverId: string;
      isTyping: boolean;
    }) => {
      setTypingData({
        senderId: data.senderId,
        receiverId: data.receiverId,
        isTyping: data.isTyping,
      });
    };

    socket?.on("typingMessageGet", handleTypingMessage);

    return () => {
      socket?.off("typingMessageGet", handleTypingMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (typingData.senderId === userId) {
      setIsTyping(typingData.isTyping);
    } else {
      setIsTyping(false);
    }
  }, [typingData, userId]);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1, // Max size (in MB) after compression
      maxWidthOrHeight: 1024, // Max width or height
      useWebWorker: true, // Use web workers for faster compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Compression failed:", error);
      return file; // fallback to original file
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image")) {
      toast.error("Please select an image file.");
      return;
    }

    const compressedFile = await compressImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(compressedFile);
  };

  const handleRemove = (): void => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const res = await sendMessage({
      receiverId: selectedUser?._id as string,
      text,
      image: imagePreview as string,
    }).unwrap();

    if (res.success) {
      handleRemove();
      setText("");
      dispatch(messageSlice.actions.setMessage(res.data));
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
        <ScrollArea
          className={`h-[calc(100vh-20rem)] ${imagePreview ? "lg:max-h-[calc(100vh-20rem)]" : "lg:h-[calc(100vh-16.5rem)]"}`}
        >
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderId === userInfo?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === userInfo?.id
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
                  <p className="text-sm">{message.text}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {message.createdAt}
                  </p>
                </div>
              </div>
            ))}
            {isTyping ? (
              <div className="max-w-[200px] rounded-lg bg-blue-500 p-3 text-white">
                <i>Typing...</i>
              </div>
            ) : null}
            <div ref={msgEndRef} />
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
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardFooter>
    </Card>
  );
}
