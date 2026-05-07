/**
 * Centralized type definitions for the chat application.
 * Import types from here instead of defining them locally.
 */

export type Message = {
  _id: string;
  createdAt: string;
  image: string;
  receiverId: string;
  senderId: string;
  text: string;
  updatedAt: string;
  read: boolean;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMessage: {
    text: string;
    image: string;
    senderId: string;
  } | null;
  lastMessageTime: string | null;
  unreadCount: number;
};

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
};

export type TypingData = {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
};

export type PaginationInfo = {
  olderCursor: string | null;
  newerCursor: string | null;
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  limit: number;
};

export type PaginatedMessagesResponse = {
  success: boolean;
  data: Message[];
  pagination: PaginationInfo;
};
