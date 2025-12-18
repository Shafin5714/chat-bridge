import { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/store";
import { useSocketContext } from "@/contexts/socket-context";
import { messageSlice } from "@/store/slices";
import { useMarkMessagesAsReadMutation } from "@/store/api/messageApi";
import type { Message } from "@/types";

type UseChatSocketOptions = {
  selectedUserId: string | undefined;
  onNewMessage: (message: Message) => void;
  refetch: () => void;
};

/**
 * Custom hook to handle socket events for chat functionality.
 * Manages newMessage and messagesRead socket events.
 */
export function useChatSocket({
  selectedUserId,
  onNewMessage,
  refetch,
}: UseChatSocketOptions) {
  const { socket } = useSocketContext();
  const dispatch = useAppDispatch();
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();

  // Handle incoming new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      onNewMessage(newMessage);

      // Auto-mark as read if chat is currently open with this user
      if (selectedUserId && newMessage.senderId === selectedUserId) {
        markMessagesAsRead(selectedUserId);
        dispatch(messageSlice.actions.markMessagesAsReadLocally(selectedUserId));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUserId, onNewMessage, markMessagesAsRead, dispatch]);

  // Handle messages read events from other users
  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = (data: { receiverId: string }) => {
      dispatch(messageSlice.actions.markMessagesAsRead(data.receiverId));
      // Fallback: Refetch messages to ensure consistency
      refetch();
    };

    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, dispatch, refetch]);

  // Mark messages as read when chat is opened
  const markAsRead = useCallback(() => {
    if (selectedUserId) {
      markMessagesAsRead(selectedUserId);
      dispatch(messageSlice.actions.markMessagesAsReadLocally(selectedUserId));
    }
  }, [selectedUserId, markMessagesAsRead, dispatch]);

  return { markAsRead };
}
