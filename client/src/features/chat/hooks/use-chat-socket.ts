import { useEffect } from "react";
import { useAppDispatch } from "@/store";
import { useSocketContext } from "@/contexts/socket-context";
import { conversationSlice } from "@/store/slices";
import type { Message, Conversation } from "@/types";

type UseChatSocketOptions = {
  selectedConversationId: string | undefined;
  onNewMessage: (message: Message) => void;
};

/**
 * Custom hook to handle socket events for chat functionality.
 * Manages newMessage and conversationUpdated socket events.
 */
export function useChatSocket({
  selectedConversationId,
  onNewMessage,
}: UseChatSocketOptions) {
  const { socket } = useSocketContext();
  const dispatch = useAppDispatch();

  // Handle incoming new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      onNewMessage(newMessage);
    };

    const handleConversationUpdated = (conversation: Conversation) => {
      dispatch(conversationSlice.actions.updateConversation(conversation));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("conversationUpdated", handleConversationUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationUpdated", handleConversationUpdated);
    };
  }, [socket, selectedConversationId, onNewMessage, dispatch]);

  return {};
}
