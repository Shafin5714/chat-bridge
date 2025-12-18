import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messageApi } from "../api/messageApi";
import { authApi } from "../api/authApi";
import type { User } from "@/types";

type UserState = {
  userList: User[];
  selectedUser: User | null;
  onlineUsers: string[];
};

const initialState: UserState = {
  userList: [],
  onlineUsers: [],
  selectedUser: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    reset: () => initialState,
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.userList = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      messageApi.endpoints.getUsers.matchFulfilled,
      (state, { payload }) => {
        state.userList = payload.data;
        state.selectedUser = payload.data[0];
      },
    );
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      () => initialState,
    );
  },
});
