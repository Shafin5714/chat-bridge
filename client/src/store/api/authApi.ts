import { emptySplitApi } from "./emptySplitApi";

type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

type RegisterResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
  };
};

export const authApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const { useRegisterMutation } = authApi;
