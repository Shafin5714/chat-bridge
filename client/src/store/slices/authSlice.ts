import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserInfo = {
  _id: string;
  token: string;
  username: string;
  email: string;
  image: string;
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

    setData: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = { ...action.payload };
      // in local-storage
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.clear();
    },
  },
});
