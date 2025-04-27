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
  success: boolean;
  data: {
    _id: string;
    createdAt: string;
    image: string;
    receiverId: string;
    senderId: string;
    text: string;
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
    getMessages: builder.query<SendMessageResponse, string>({
      query: (id) => ({
        url: `/message/${id}`,
        providesTags: ["Message"],
      }),
    }),
  }),
});

export const { useGetUsersQuery, useSendMessageMutation, useGetMessagesQuery } =
  messageApi;
