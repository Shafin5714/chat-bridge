import { RefObject, UIEvent } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import type { Message, Conversation, UserInfo } from "@/types";
import MessageBubble from "./message-bubble";

type ChatMessagesProps = {
  messages: Message[];
  isFetching: boolean;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  showScrollBottom: boolean;
  isTyping: boolean;
  typerNames: string[];
  userInfo: UserInfo | null;
  selectedConversation: Conversation | null;
  paginationQuery: any;
  scrollRef: RefObject<HTMLDivElement>;
  msgEndRef: RefObject<HTMLDivElement>;
  onScrollWrapper: (e: UIEvent<HTMLDivElement>) => void;
  scrollToBottom: () => void;
  handleJumpToPresent: () => void;
};

export default function ChatMessages({
  messages,
  isFetching,
  hasMoreOlder,
  hasMoreNewer,
  showScrollBottom,
  isTyping,
  typerNames,
  userInfo,
  selectedConversation,
  paginationQuery,
  scrollRef,
  msgEndRef,
  onScrollWrapper,
  scrollToBottom,
  handleJumpToPresent,
}: ChatMessagesProps) {
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
    const member = selectedConversation?.members.find(
      (m) => m._id === senderId,
    );
    return {
      name: member?.name || "Unknown",
      profilePic: member?.profilePic,
      id: senderId,
    };
  };

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden dark:bg-gray-900">
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
        className="absolute inset-0 overflow-y-auto p-5 pr-3"
      >
        <div className="flex min-h-full flex-col justify-end gap-3">
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
              <MessageBubble
                key={message._id}
                message={message}
                isMe={isMe}
                isGroup={isGroup}
                sender={sender}
                onLoad={() => {
                  if (!showScrollBottom) scrollToBottom();
                }}
              />
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
    </div>
  );
}
