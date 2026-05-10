import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { BASE_URL } from "@/config/env";
import { toast } from "sonner";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include", // to include the cookie
});

type CustomError = {
  status: number;
  data: {
    message: string;
  };
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt to refresh the access token
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Refresh succeeded — retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — session is truly expired
      const { authSlice } = await import("../slices/auth-slice");
      api.dispatch(authSlice.actions.logout());
    }
  }

  if (result.error) {
    const err = result.error as CustomError;
    if (err.data?.message) {
      console.error(err.data.message);
      toast.error(err.data.message);
    }
  }

  return result;
};

export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users", "Message", "Conversations"],
  endpoints: () => ({}),
});
