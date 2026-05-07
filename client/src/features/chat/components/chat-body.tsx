import {
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
} from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, X, Loader2, Circle, Smile, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toast } from "sonner";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
  useLazySearchMessagesQuery,
} from "@/store/api/messageApi";
import imageCompression from "browser-image-compression";
import { skipToken } from "@reduxjs/toolkit/query";
import { messageSlice } from "@/store/slices";
import moment from "moment";
import { cn } from "@/lib/utils";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import type { Message } from "@/types";
import { useChatSocket, useTypingIndicator, useInfiniteScroll } from "../hooks";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

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
  const { messages, hasMoreOlder, hasMoreNewer, olderCursor, newerCursor } = useAppSelector((state) => state.message);
  const { userInfo } = useAppSelector((state) => state.auth);

  const [paginationQuery, setPaginationQuery] = useState<{
    cursor?: string | null;
    newerCursor?: string | null;
    around?: string | null;
  } | null>(null);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMessages, { data: searchResults, isFetching: isSearching }] = useLazySearchMessagesQuery();

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // api
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const userId = selectedUser?._id ?? skipToken;
  const queryArgs = userId === skipToken ? skipToken : { userId, ...paginationQuery };
  const { data, refetch, isFetching } = useGetMessagesQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  // Debounced Search Effect
  useEffect(() => {
    if (!showSearch) {
      setSearchQuery("");
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() && selectedUser?._id) {
        searchMessages({ userId: selectedUser._id, q: searchQuery });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSearch, selectedUser?._id, searchMessages]);

  const handleJumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-blue-100", "dark:bg-blue-900/40");
      setTimeout(() => el.classList.remove("bg-blue-100", "dark:bg-blue-900/40"), 2000);
      setShowSearch(false);
    } else {
      setPaginationQuery({ around: messageId });
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (paginationQuery?.around && !isFetching && messages.find((m) => m._id === paginationQuery.around)) {
      const el = document.getElementById(`msg-${paginationQuery.around}`);
      if (el) {
        el.scrollIntoView({ block: "center" });
        el.classList.add("bg-blue-100", "dark:bg-blue-900/40");
        setTimeout(() => el.classList.remove("bg-blue-100", "dark:bg-blue-900/40"), 2000);
      }
    }
  }, [paginationQuery?.around, isFetching, messages]);

  const handleJumpToPresent = () => {
    setPaginationQuery(null);
  };

  const { scrollRef, handleScroll, restoreScrollPosition } = useInfiniteScroll({
    hasMoreOlder,
    hasMoreNewer,
    isLoading: isFetching,
    onLoadOlder: () => {
      if (olderCursor) setPaginationQuery({ cursor: olderCursor });
    },
    onLoadNewer: () => {
      if (newerCursor) setPaginationQuery({ newerCursor });
    },
  });

  // Restore position after older messages load
  useEffect(() => {
    if (paginationQuery?.cursor && !isFetching) {
      restoreScrollPosition();
    }
  }, [isFetching, paginationQuery?.cursor, restoreScrollPosition]);

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
    // Only auto-scroll to bottom on initial load or if we haven't scrolled up
    if (!paginationQuery) {
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  }, [data, isTyping, paginationQuery]);

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
      if (!hasMoreNewer) {
        dispatch(messageSlice.actions.setMessage(newMessage));
        setTimeout(() => scrollToBottom(), 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, hasMoreNewer]);

  // Reset form when switching users
  useEffect(() => {
    setText("");
    setImagePreview(null);
    setPaginationQuery(null);
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
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const userOnline = onlineUsers.includes(selectedUser?._id as string);

  return (
    <Card
      className={`borer-y-1 flex h-full flex-1 flex-col rounded-none border dark:border-gray-700 dark:border-b-[#1B2332] dark:border-t-[#1B2332] ${
        mobileView === "chat" ? "block" : "hidden"
      } lg:block`}
    >
      <CardHeader className="relative h-16 px-4 py-3">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedUser?.profilePic} />
              <AvatarFallback>
                <UserIcon className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
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
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-500"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {showSearch && (
          <div className="absolute left-0 right-0 top-16 z-20 border-b bg-white p-3 shadow-md dark:border-gray-800 dark:bg-gray-900">
            <Input
              autoFocus
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800"
            />
            {searchQuery && (
              <div className="absolute left-0 right-0 top-[100%] max-h-64 overflow-y-auto border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : searchResults?.data && searchResults.data.length > 0 ? (
                  searchResults.data.map((msg) => (
                    <div
                      key={msg._id}
                      className="cursor-pointer border-b p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      onClick={() => handleJumpToMessage(msg._id)}
                    >
                      <p className="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">{msg.text}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {moment(msg.createdAt).format("MMM D, YYYY h:mm A")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No messages found</div>
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <Separator className="dark:bg-gray-700" />
      <CardContent className="relative flex-1 overflow-hidden p-5 dark:bg-gray-900">
        {hasMoreNewer && (
          <div className="absolute bottom-5 right-5 z-10">
            <Button
              onClick={handleJumpToPresent}
              className="rounded-full shadow-lg transition-transform hover:scale-105"
            >
              ↓ Jump to Present
            </Button>
          </div>
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`overflow-y-auto pr-3 h-[calc(100vh-22rem)] ${imagePreview ? "lg:h-[calc(100vh-18.5rem)]" : "lg:h-[calc(100vh-16rem)]"}`}
        >
          <div className="flex min-h-full flex-col justify-between gap-3">
            {isFetching && paginationQuery?.cursor && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
            {!hasMoreOlder && messages.length > 0 && (
              <p className="py-2 text-center text-xs text-gray-400">
                Beginning of conversation
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message._id}
                id={`msg-${message._id}`}
                className={cn(
                  "flex rounded-lg transition-colors duration-500",
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
              <div className="flex justify-start">
                <div className="w-fit rounded-lg bg-gray-200 p-3 dark:bg-gray-800 dark:text-gray-300">
                  <div className="typing-dots">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={msgEndRef} />
            {isFetching && paginationQuery?.newerCursor && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>
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
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              autoFocus
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-12 flex-1 dark:border-gray-800 dark:bg-gray-900"
            />

            <div className="relative">
              {showPicker && (
                <div className="absolute bottom-12 right-0 z-10">
                  <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
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
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Image className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-16 shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
