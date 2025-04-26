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

type SendMessageRequest = {
  senderId: string;
  text: string;
  image: string;
};

type SendMessageResponse = {
  _id: string;
};

export const messageApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserResponse, void>({
      query: () => ({ url: "/message/users" }),
      providesTags: ["Users"],
      transformResponse: (response: UserResponse) => response,
    }),
    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: (data) => ({
        url: `/message/send/${data.senderId}`,
        method: "POST",
        body: {
          text: data.text,
          image: data.image,
        },
      }),
    }),
  }),
});

export const { useGetUsersQuery, useSendMessageMutation } = messageApi;
