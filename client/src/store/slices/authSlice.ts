import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

type UserInfo = {
  id: string;
  name: string;
  email: string;
};
type AuthState = {
  userInfo: UserInfo | null;
};

const initialState: AuthState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string)
    : null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,

    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = { ...action.payload };
      // in local-storage
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    });
  },
});
