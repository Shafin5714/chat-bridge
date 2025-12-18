import { useEffect, useState } from "react";
import { useSocketContext } from "@/contexts/socket-context";
import type { TypingData } from "@/types";

type UseTypingIndicatorOptions = {
  currentUserId: string | undefined;
  selectedUserId: string | undefined;
  text: string;
};

/**
 * Custom hook to handle typing indicator functionality.
 * Emits typing status and listens for typing events from other users.
 */
export function useTypingIndicator({
  currentUserId,
  selectedUserId,
  text,
}: UseTypingIndicatorOptions): boolean {
  const { socket } = useSocketContext();
  const [typingData, setTypingData] = useState<TypingData>({
    senderId: "",
    receiverId: "",
    isTyping: false,
  });
  const [isTyping, setIsTyping] = useState(false);

  // Emit typing status when text changes
  useEffect(() => {
    if (!socket || !currentUserId || !selectedUserId) return;

    socket.emit("typingMessage", {
      senderId: currentUserId,
      receiverId: selectedUserId,
      isTyping: text.length > 0,
    });
  }, [socket, text, selectedUserId, currentUserId]);

  // Listen for typing status from other users
  useEffect(() => {
    if (!socket) return;

    const handleTypingMessage = (data: TypingData) => {
      setTypingData(data);
    };

    socket.on("typingMessageGet", handleTypingMessage);

    return () => {
      socket.off("typingMessageGet", handleTypingMessage);
    };
  }, [socket]);

  // Determine if selected user is typing
  useEffect(() => {
    if (typingData.senderId === selectedUserId) {
      setIsTyping(typingData.isTyping);
    } else {
      setIsTyping(false);
    }
  }, [typingData, selectedUserId]);

  return isTyping;
}
