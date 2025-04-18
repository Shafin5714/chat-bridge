import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { BASE_URL } from "@/constants";

import { authSlice } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    api.dispatch(authSlice.actions.logout());
  }

  if (result.error) {
    console.error(result.error);
  }
  return result;
};
export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Order", "User"],
  endpoints: () => ({}),
});
