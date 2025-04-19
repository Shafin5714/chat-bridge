import { emptySplitApi } from "./emptySplitApi";

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
  };
};

type LogoutResponse = {
  success: boolean;
  message: string;
};

export const authApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const { useRegisterMutation, useLogoutMutation, useLoginMutation } =
  authApi;
