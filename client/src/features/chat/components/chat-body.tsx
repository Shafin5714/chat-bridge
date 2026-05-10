import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGetMessagesQuery } from "@/store/api/message-api";
import { skipToken } from "@reduxjs/toolkit/query";
import { messageSlice } from "@/store/slices";
import type { Message } from "@/types";
import { useChatSocket, useTypingIndicator, useInfiniteScroll } from "../hooks";

import ChatHeader from "./chat-header";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";

type Props = {
  mobileView: string;
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

export default function Chat({ mobileView, setMobileView }: Props) {
  const dispatch = useAppDispatch();

  // states
  const [showSearch, setShowSearch] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [newMessage, setNewMessage] = useState<Message>();
  const [typingText, setTypingText] = useState("");

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

  // api
  const conversationId = selectedConversation?._id ?? skipToken;
  const queryArgs =
    conversationId === skipToken
      ? skipToken
      : { conversationId, ...paginationQuery };
  const { data, isFetching } = useGetMessagesQuery(queryArgs, {
    refetchOnMountOrArgChange: true,
  });

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
    text: typingText,
  });

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

  // Reset pagination when switching conversations
  useEffect(() => {
    setPaginationQuery(null);
    setShowSearch(false);
  }, [selectedConversation?._id]);

  // Helper: get the "other user" for DMs
  const otherUser =
    selectedConversation?.type === "dm"
      ? selectedConversation.members.find((m) => m._id !== userInfo?.id)
      : null;

  const isConversationOnline =
    selectedConversation?.type === "dm" && otherUser
      ? onlineUsers.includes(otherUser._id)
      : false;

  const headerName =
    selectedConversation?.type === "group"
      ? selectedConversation.name || "Group"
      : otherUser?.name || "";

  const headerAvatar =
    selectedConversation?.type === "group"
      ? selectedConversation.avatar || undefined
      : otherUser?.profilePic;

  return (
    <Card
      className={`borer-y-1 flex h-full flex-1 flex-col rounded-none border dark:border-gray-700 dark:border-b-[#1B2332] dark:border-t-[#1B2332] ${
        mobileView === "chat" ? "flex" : "hidden"
      } lg:flex`}
    >
      <ChatHeader
        conversationType={selectedConversation?.type}
        headerName={headerName}
        headerAvatar={headerAvatar}
        isOnline={isConversationOnline}
        memberCount={selectedConversation?.members.length || 0}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        conversationId={selectedConversation?._id}
        onJumpToMessage={handleJumpToMessage}
        setMobileView={setMobileView}
        lastSeen={otherUser?.lastSeen}
      />
      <Separator className="dark:bg-gray-700" />
      <ChatMessages
        messages={messages}
        isFetching={isFetching}
        hasMoreOlder={hasMoreOlder}
        hasMoreNewer={hasMoreNewer}
        showScrollBottom={showScrollBottom}
        isTyping={isTyping}
        typerNames={typerNames}
        userInfo={userInfo}
        selectedConversation={selectedConversation}
        paginationQuery={paginationQuery}
        scrollRef={scrollRef}
        msgEndRef={msgEndRef}
        onScrollWrapper={onScrollWrapper}
        scrollToBottom={scrollToBottom}
        handleJumpToPresent={handleJumpToPresent}
      />
      <Separator />
      <ChatInput
        conversationId={selectedConversation?._id}
        onTyping={setTypingText}
        onMessageSent={() => setTimeout(() => scrollToBottom(), 100)}
      />
    </Card>
  );
}
