import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messageApi } from "../api/messageApi";
import { authApi } from "../api/authApi";
import type { Message } from "@/types";

type MessageState = {
  messages: Message[];
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  olderCursor: string | null;
  newerCursor: string | null;
};

const initialState: MessageState = {
  messages: [],
  hasMoreOlder: true,
  hasMoreNewer: false,
  olderCursor: null,
  newerCursor: null,
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
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      messageApi.endpoints.getMessages.matchFulfilled,
      (state, { payload, meta }) => {
        const { cursor, newerCursor, around } = meta.arg.originalArgs;
        if (around) {
          state.messages = payload.data;
        } else if (cursor) {
          state.messages = [...payload.data, ...state.messages];
        } else if (newerCursor) {
          state.messages = [...state.messages, ...payload.data];
        } else {
          state.messages = payload.data;
        }

        state.hasMoreOlder =
          payload.pagination.hasMoreOlder ?? state.hasMoreOlder;
        if (payload.pagination.olderCursor !== undefined) {
          state.olderCursor = payload.pagination.olderCursor;
        }

        state.hasMoreNewer =
          payload.pagination.hasMoreNewer ?? state.hasMoreNewer;
        if (payload.pagination.newerCursor !== undefined) {
          state.newerCursor = payload.pagination.newerCursor;
        }
      }
    );
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      () => initialState
    );
  },
});
