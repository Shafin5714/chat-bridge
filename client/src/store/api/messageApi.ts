import { emptySplitApi } from "./emptySplitApi";

type UserResponse = {
  success: boolean;
  data: {
    _id: string;
    email: string;
    name: string;
    profilePic: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

export const messageApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserResponse, void>({
      query: () => ({ url: "/message/users" }),
      providesTags: ["Users"],
      transformResponse: (response: UserResponse) => response,
    }),
  }),
});

export const { useGetUsersQuery } = messageApi;
