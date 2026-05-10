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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, X, Loader2, Circle, Smile, Search, Users, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { toast } from "sonner";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
  useLazySearchMessagesQuery,
} from "@/store/api/message-api";
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
  const dispatch = useAppDispatch();

  // states
  const [text, setText] = useState<string>("");
  const [showPicker, setShowPicker] = useState(false);
  const [newMessage, setNewMessage] = useState<Message>();
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null,
  );
  const { selectedConversation, onlineUsers } = useAppSelector(
    (state) => state.conversation,
  );
  const { messages, hasMoreOlder, hasMoreNewer, olderCursor, newerCursor } =
    useAppSelector((state) => state.message);
  const { userInfo } = useAppSelector((state) => state.auth);

  const [paginationQuery, setPaginationQuery] = useState<{
    cursor?: string | null;
    newerCursor?: string | null;
    around?: string | null;
  } | null>(null);

  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [searchMessages, { data: searchResults, isFetching: isSearching }] =
    useLazySearchMessagesQuery();

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // api
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const conversationId = selectedConversation?._id ?? skipToken;
  const queryArgs =
    conversationId === skipToken
      ? skipToken
      : { conversationId, ...paginationQuery };
  const { data, isFetching } = useGetMessagesQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

  // Debounced Search Effect
  useEffect(() => {
    if (!showSearch) {
      setSearchQuery("");
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() && selectedConversation?._id) {
        searchMessages({
          conversationId: selectedConversation._id,
          q: searchQuery,
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSearch, selectedConversation?._id, searchMessages]);

  const handleJumpToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-blue-100", "dark:bg-blue-900/40");
      setTimeout(
        () => el.classList.remove("bg-blue-100", "dark:bg-blue-900/40"),
        2000,
      );
      setShowSearch(false);
    } else {
      setPaginationQuery({ around: messageId });
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (
      paginationQuery?.around &&
      !isFetching &&
      messages.find((m) => m._id === paginationQuery.around)
    ) {
      const el = document.getElementById(`msg-${paginationQuery.around}`);
      if (el) {
        el.scrollIntoView({ block: "center" });
        el.classList.add("bg-blue-100", "dark:bg-blue-900/40");
        setTimeout(
          () => el.classList.remove("bg-blue-100", "dark:bg-blue-900/40"),
          2000,
        );
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

  const onScrollWrapper = (e: React.UIEvent<HTMLDivElement>) => {
    handleScroll();
    const el = e.currentTarget;
    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(scrollBottom > 200);
  };

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

  useChatSocket({
    selectedConversationId: selectedConversation?._id,
    onNewMessage: handleNewMessage,
  });

  const { isTyping, typerNames } = useTypingIndicator({
    currentUserId: userInfo?.id,
    conversationId: selectedConversation?._id,
    text,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const msgEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!paginationQuery) {
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  }, [data, isTyping, paginationQuery]);

  // Add new message to local state
  useEffect(() => {
    const msgConversationId =
      typeof newMessage?.conversationId === "string"
        ? newMessage.conversationId
        : "";
    const isForThisConversation =
      msgConversationId === selectedConversation?._id;
    if (isForThisConversation && newMessage) {
      if (!hasMoreNewer) {
        // Avoid duplicating if it's our own message (already added optimistically)
        const senderId =
          typeof newMessage.senderId === "string"
            ? newMessage.senderId
            : newMessage.senderId._id;
        if (senderId !== userInfo?.id) {
          dispatch(messageSlice.actions.setMessage(newMessage));
        }
        setTimeout(() => scrollToBottom(), 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, hasMoreNewer]);

  // Reset form when switching conversations
  useEffect(() => {
    setText("");
    setImagePreview(null);
    setPaginationQuery(null);
    setShowPicker(false);
    setShowSearch(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedConversation?._id]);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Compression failed:", error);
      return file;
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
      conversationId: selectedConversation?._id as string,
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

  // Helper: get the "other user" for DMs
  const otherUser =
    selectedConversation?.type === "dm"
      ? selectedConversation.members.find((m) => m._id !== userInfo?.id)
      : null;

  const isConversationOnline =
    selectedConversation?.type === "dm" && otherUser
      ? onlineUsers.includes(otherUser._id)
      : false;

  // Helper: get sender display info from a message
  const getSenderInfo = (
    senderId: Message["senderId"],
  ): { name: string; profilePic?: string; id: string } => {
    if (typeof senderId === "object" && senderId !== null) {
      return {
        name: senderId.name,
        profilePic: senderId.profilePic,
        id: senderId._id,
      };
    }
    // Fallback: find in conversation members
    const member = selectedConversation?.members.find(
      (m) => m._id === senderId,
    );
    return {
      name: member?.name || "Unknown",
      profilePic: member?.profilePic,
      id: senderId,
    };
  };

  // Header display name
  const headerName =
    selectedConversation?.type === "group"
      ? selectedConversation.name || "Group"
      : otherUser?.name || "";

  // Header avatar
  const headerAvatar =
    selectedConversation?.type === "group"
      ? selectedConversation.avatar || undefined
      : otherUser?.profilePic;

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
                <AvatarImage src={headerAvatar} />
                <AvatarFallback>
                  {selectedConversation?.type === "group" ? (
                    <Users className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>
              {selectedConversation?.type === "dm" && (
                <p className="absolute bottom-[1px] right-1 text-xs text-gray-500">
                  {isConversationOnline ? (
                    <Circle fill="green" size={12} strokeWidth={0} />
                  ) : (
                    <Circle
                      className="rounded-full bg-red-600"
                      size={10}
                      strokeWidth={0}
                    />
                  )}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight text-gray-900 dark:text-[#E1E1E1]">
                {headerName}
              </h2>
              <p
                className={cn(
                  "text-sm font-normal",
                  selectedConversation?.type === "group"
                    ? "text-gray-500"
                    : isConversationOnline
                      ? "text-green-500"
                      : "text-red-600",
                )}
              >
                {selectedConversation?.type === "group"
                  ? `${selectedConversation.members.length} members`
                  : isConversationOnline
                    ? "Online"
                    : "Offline"}
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
                  <div className="p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                ) : searchResults?.data && searchResults.data.length > 0 ? (
                  searchResults.data.map((msg) => (
                    <div
                      key={msg._id}
                      className="cursor-pointer border-b p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      onClick={() => handleJumpToMessage(msg._id)}
                    >
                      <p className="line-clamp-2 text-sm text-gray-800 dark:text-gray-200">
                        {msg.text}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {moment(msg.createdAt).format("MMM D, YYYY h:mm A")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No messages found
                  </div>
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
        {!hasMoreNewer && showScrollBottom && (
          <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
            <Button
              onClick={scrollToBottom}
              variant="secondary"
              size="icon"
              className="rounded-full border bg-white shadow-lg transition-transform hover:scale-105 dark:bg-gray-800"
            >
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        )}
        <div
          ref={scrollRef}
          onScroll={onScrollWrapper}
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
            {messages.map((message) => {
              const senderIdStr =
                typeof message.senderId === "string"
                  ? message.senderId
                  : message.senderId._id;
              const isMe = senderIdStr === userInfo?.id;
              const sender = getSenderInfo(message.senderId);
              const isGroup = selectedConversation?.type === "group";

              return (
                <div
                  key={message._id}
                  id={`msg-${message._id}`}
                  className={cn(
                    "flex rounded-lg transition-colors duration-500",
                    isMe ? "justify-end" : "justify-start",
                  )}
                >
                  {/* Group chat: show sender avatar on left */}
                  {isGroup && !isMe && (
                    <div className="mr-2 mt-1 flex-shrink-0">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={sender.profilePic} />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isMe
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {/* Group chat: show sender name */}
                    {isGroup && !isMe && (
                      <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {sender.name}
                      </p>
                    )}
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
                        isMe
                          ? "text-gray-200"
                          : "text-gray-600 dark:text-gray-400",
                      )}
                    >
                      {moment(message.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              );
            })}
            {isTyping ? (
              <div className="flex justify-start">
                <div className="w-fit rounded-lg bg-gray-200 p-3 dark:bg-gray-800 dark:text-gray-300">
                  <p className="mb-1 text-xs text-gray-500">
                    {selectedConversation?.type === "group"
                      ? `${typerNames.join(", ")} ${typerNames.length > 1 ? "are" : "is"} typing`
                      : "Typing"}
                  </p>
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
