import { useEffect, useState } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import type { TypingData } from "@/types";

type UseTypingIndicatorOptions = {
  currentUserId: string | undefined;
  conversationId: string | undefined;
  text: string;
};

/**
 * Custom hook to handle typing indicator functionality.
 * Emits typing status and listens for typing events from other users.
 * For groups, tracks multiple typers.
 */
export function useTypingIndicator({
  currentUserId,
  conversationId,
  text,
}: UseTypingIndicatorOptions): { isTyping: boolean; typerNames: string[] } {
  const { socket } = useSocketContext();
  const [typers, setTypers] = useState<Map<string, string>>(new Map());

  // Emit typing status when text changes
  useEffect(() => {
    if (!socket || !currentUserId || !conversationId) return;

    socket.emit("typingMessage", {
      senderId: currentUserId,
      conversationId,
      isTyping: text.length > 0,
    });
  }, [socket, text, conversationId, currentUserId]);

  // Listen for typing status from other users
  useEffect(() => {
    if (!socket) return;

    const handleTypingMessage = (data: TypingData & { senderName?: string }) => {
      if (data.conversationId !== conversationId) return;
      if (data.senderId === currentUserId) return;

      setTypers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.senderId, data.senderName || "Someone");
        } else {
          next.delete(data.senderId);
        }
        return next;
      });
    };

    socket.on("typingMessageGet", handleTypingMessage);

    return () => {
      socket.off("typingMessageGet", handleTypingMessage);
    };
  }, [socket, conversationId, currentUserId]);

  // Reset typers when conversation changes
  useEffect(() => {
    setTypers(new Map());
  }, [conversationId]);

  const isTyping = typers.size > 0;
  const typerNames = Array.from(typers.values());

  return { isTyping, typerNames };
}
