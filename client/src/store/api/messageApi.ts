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
    lastMessage: {
      text: string;
      image: string;
      senderId: string;
    } | null;
    lastMessageTime: string | null;
    unreadCount: number;
  }[];
};

type SendMessageRequest = {
  receiverId: string;
  text: string;
  image: string;
};

type Message = {
  _id: string;
  createdAt: string;
  image: string;
  receiverId: string;
  senderId: string;
  text: string;
  updatedAt: string;
};

type SendMessageResponse = {
  success: boolean;
  data: Message;
};

type GetMessagesResponse = {
  success: boolean;
  data: Message[];
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
        url: `/message/send/${data.receiverId}`,
        method: "POST",
        body: {
          text: data.text,
          image: data.image,
        },
      }),
    }),
    getMessages: builder.query<GetMessagesResponse, string>({
      query: (id) => ({
        url: `/message/${id}`,
        providesTags: ["Message"],
      }),
    }),
  }),
});

export const { useGetUsersQuery, useSendMessageMutation, useGetMessagesQuery } =
  messageApi;
