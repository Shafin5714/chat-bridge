import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { BASE_URL } from "@/constants";
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
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // Lazy import to avoid circular dependency [for matchFulfilled in slice]
    const { authSlice } = await import("../slices/authSlice");
    api.dispatch(authSlice.actions.logout());
  }

  if (result.error) {
    console.error((result.error as CustomError).data.message);
    toast.error((result.error as CustomError).data.message);
  }
  return result;
};
export const emptySplitApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users", "Message"],
  endpoints: () => ({}),
});
