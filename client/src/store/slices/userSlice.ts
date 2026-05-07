import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

type UserState = {
  // Kept for potential future use but core user list is now in conversationSlice
};

const initialState: UserState = {};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled,
      () => initialState
    );
  },
});
