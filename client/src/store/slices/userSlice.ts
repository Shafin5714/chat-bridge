import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messageApi } from "../api/messageApi";

type User = {
  _id: string;
  name: string;
  email: string;
};

type messageState = {
  userList: User[];
  selectedUser: User | null;
};

const initialState: messageState = {
  userList: [],
  selectedUser: null,
};

export const userSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    reset: () => initialState,
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.userList = { ...action.payload };
    },
    setSelectedUser: (state, action: PayloadAction<User>) => {
      state.selectedUser = action.payload;
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
  },
});
