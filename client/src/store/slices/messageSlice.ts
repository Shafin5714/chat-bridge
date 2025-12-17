import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messageApi } from "../api/messageApi";

type Message = {
  _id: string;
  createdAt: string;
  image: string;
  receiverId: string;
  senderId: string;
  text: string;
  updatedAt: string;
  read: boolean;
};

type messageState = {
  messages: Message[];
};

const initialState: messageState = {
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
  },
});
