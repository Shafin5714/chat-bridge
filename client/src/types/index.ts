/**
 * Centralized type definitions for the chat application.
 * Import types from here instead of defining them locally.
 */

export type Message = {
  _id: string;
  createdAt: string;
  image: string;
  conversationId: string;
  senderId:
    | string
    | {
        _id: string;
        name: string;
        profilePic?: string;
      };
  text: string;
  updatedAt: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Conversation = {
  _id: string;
  type: "dm" | "group";
  name: string | null;
  avatar: string | null;
  admin: string | null;
  members: User[];
  lastMessage: Message | null;
  updatedAt: string;
  createdAt: string;
};

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
};

export type TypingData = {
  senderId: string;
  conversationId: string;
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
