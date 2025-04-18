import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authSlice } from "./slices";

// modules
import { emptySplitApi } from "./api/emptySplitApi";
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [emptySplitApi.reducerPath]: emptySplitApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(emptySplitApi.middleware),
  devTools: true,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
