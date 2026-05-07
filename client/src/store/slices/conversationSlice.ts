import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { conversationApi } from "../api/conversationApi";
import { authApi } from "../api/authApi";
import type { Conversation } from "@/types";

type ConversationState = {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onlineUsers: string[];
};

const initialState: ConversationState = {
  conversations: [],
  selectedConversation: null,
  onlineUsers: [],
};

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    reset: () => initialState,
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setSelectedConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.selectedConversation = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const updated = action.payload;
      const index = state.conversations.findIndex(
        (c) => c._id === updated._id
      );
      if (index >= 0) {
        state.conversations[index] = updated;
      } else {
        state.conversations.unshift(updated);
      }
      // Re-sort by updatedAt
      state.conversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      // Update selected if it's the same conversation
      if (state.selectedConversation?._id === updated._id) {
        state.selectedConversation = updated;
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (c) => c._id !== action.payload
      );
      if (state.selectedConversation?._id === action.payload) {
        state.selectedConversation = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      conversationApi.endpoints.getConversations.matchFulfilled,
      (state, { payload }) => {
        state.conversations = payload.data;
      }
    );
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      () => initialState
    );
  },
});
