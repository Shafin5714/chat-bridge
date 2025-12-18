import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messageApi } from "../api/messageApi";
import { authApi } from "../api/authApi";
import type { Message } from "@/types";

type MessageState = {
  messages: Message[];
};

const initialState: MessageState = {
  messages: [],
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    reset: () => initialState,
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = [...state.messages, ...action.payload];
    },
    setMessage: (state, action: PayloadAction<Message>) => {
      state.messages = [...state.messages, action.payload];
    },
    markMessagesAsReadLocally: (state, action: PayloadAction<string>) => {
      const senderId = action.payload;
      state.messages = state.messages.map((msg) =>
        msg.senderId === senderId ? { ...msg, read: true } : msg,
      );
    },
    // New Reducer for socket event
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
       const receiverId = action.payload;
       state.messages = state.messages.map((msg) => 
        msg.receiverId === receiverId ? { ...msg, read: true } : msg
       );
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      messageApi.endpoints.getMessages.matchFulfilled,
      (state, { payload }) => {
        state.messages = payload.data;
      },
    );
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, () => initialState);
  },
});
