import { useState, useRef, ChangeEvent, FormEvent, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, X, Loader2, Circle, Smile } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toast } from "sonner";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
} from "@/store/api/messageApi";
import imageCompression from "browser-image-compression";
import { skipToken } from "@reduxjs/toolkit/query";
import { messageSlice } from "@/store/slices";
import moment from "moment";
import { cn } from "@/lib/utils";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import type { Message } from "@/types";
import { useChatSocket, useTypingIndicator } from "../hooks";

type Props = {
  mobileView: string;
};

export default function Chat({ mobileView }: Props) {
  // hooks
  const dispatch = useAppDispatch();

  // states
  const [text, setText] = useState<string>("");
  const [showPicker, setShowPicker] = useState(false);
  const [newMessage, setNewMessage] = useState<Message>();
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const { selectedUser, onlineUsers } = useAppSelector((state) => state.user);
  const { messages } = useAppSelector((state) => state.message);
  const { userInfo } = useAppSelector((state) => state.auth);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // api
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const userId = selectedUser?._id ?? skipToken;
  const { data, refetch } = useGetMessagesQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  // Custom hooks for socket handling
  const handleNewMessage = useCallback((message: Message) => {
    setNewMessage(message);
  }, []);

  const { markAsRead } = useChatSocket({
    selectedUserId: selectedUser?._id,
    onNewMessage: handleNewMessage,
    refetch,
  });

  const isTyping = useTypingIndicator({
    currentUserId: userInfo?.id,
    selectedUserId: selectedUser?._id,
    text,
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
  }, [data, messages, isTyping]);

  // Mark messages as read when chat is opened with unread messages
  useEffect(() => {
    if (selectedUser && data?.data && data.data.length > 0) {
      const hasUnreadMessages = data.data.some(
        (message) => message.senderId === selectedUser._id && !message.read,
      );

      if (hasUnreadMessages) {
        markAsRead();
      }
    }
  }, [selectedUser?._id, data, markAsRead]);

  // Add new message to local state
  useEffect(() => {
    const isMessageSentFromSelectedUser = newMessage?.senderId === userId;
    if (isMessageSentFromSelectedUser && newMessage) {
      dispatch(messageSlice.actions.setMessage(newMessage));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  // Reset form when switching users
  useEffect(() => {
    setText("");
    setImagePreview(null);
    setShowPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedUser?._id]);

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

  const userOnline = onlineUsers.includes(selectedUser?._id as string);

  return (
    <Card
      className={`borer-y-1 flex h-full flex-1 flex-col rounded-none border dark:border-gray-700 dark:border-b-[#1B2332] dark:border-t-[#1B2332] ${
        mobileView === "chat" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader className="h-16 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="/user-placeholder.png"
              alt="user image"
              className="h-10 w-10 rounded-full object-cover"
            />
            <p className="absolute bottom-[1px] right-1 text-xs text-gray-500">
              {userOnline ? (
                <Circle fill="green" size={12} strokeWidth={0} />
              ) : (
                <Circle
                  className="rounded-full bg-red-600"
                  size={10}
                  strokeWidth={0}
                />
              )}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight text-gray-900 dark:text-[#E1E1E1]">
              {selectedUser?.name}
            </h2>
            <p
              className={cn(
                "text-sm font-normal",
                userOnline ? "text-green-500" : "text-red-600",
              )}
            >
              {userOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator className="dark:bg-gray-700" />
      <CardContent className="flex-1 overflow-hidden p-5 dark:bg-gray-900">
        <ScrollArea
          className={`h-[calc(100vh-22rem)] ${imagePreview ? "lg:h-[calc(100vh-18.5rem)]" : "lg:h-[calc(100vh-16rem)]"}`}
        >
          <div className="flex flex-col justify-between gap-3">
            {messages.map((message) => (
              <div
                key={message._id}
                className={cn(
                  "flex",
                  message.senderId === userInfo?.id
                    ? "justify-end"
                    : "justify-start",
                )}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === userInfo?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image || "/placeholder.svg"}
                      alt="Shared"
                      className="mb-2 max-w-sm rounded-lg"
                    />
                  )}
                  <p className="text-[1rem]">{message.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      message.senderId === userInfo?.id
                        ? "text-gray-200"
                        : "text-gray-600 dark:text-gray-400",
                    )}
                  >
                    {moment(message.createdAt).fromNow()}
                    {message.senderId === userInfo?.id && (
                      <span className="ml-2 inline-block">
                        {message.read ? (
                          <span className="text-blue-200">✓✓</span>
                        ) : (
                          <span className="text-gray-400">✓</span>
                        )}
                      </span>
                    )}
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
      <div className="px-3">
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
            <img
              src={imagePreview as string}
              className="h-10 w-28"
              alt="image preview"
            />
          </div>
        ) : null}

        <div className="mt-3 w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(e);
              e.stopPropagation();
            }}
            className="flex w-full space-x-2 items-center"
          >
            <Input
              type="text"
              autoFocus
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-10 flex-1 dark:bg-gray-900"
            />

            <div className="relative">
              {showPicker && (
                <div className="absolute bottom-12 right-0 z-10">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme={Theme.AUTO}
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="h-10 w-10 px-0"
                onClick={() => setShowPicker((prev) => !prev)}
              >
                <Smile className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                type="button"
                className="h-10 w-14"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                variant="outline"
              >
                <Image />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading}
              className="h-10 w-14"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
