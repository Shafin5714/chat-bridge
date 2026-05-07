import { emptySplitApi } from "./emptySplitApi";
import type { Message, User, PaginatedMessagesResponse } from "@/types";

export type UserResponse = {
  success: boolean;
  data: User[];
};

export type SendMessageRequest = {
  receiverId: string;
  text: string;
  image: string;
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
    getMessages: builder.query<
      PaginatedMessagesResponse,
      { userId: string; cursor?: string | null }
    >({
      query: ({ userId, cursor }) => ({
        url: `/message/${userId}`,
        params: { ...(cursor ? { cursor } : {}), limit: 30 },
      }),
      providesTags: ["Message"],
      serializeQueryArgs: ({ queryArgs }) => queryArgs.userId,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg.cursor) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...newItems.data, ...currentCache.data],
          pagination: newItems.pagination,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg !== previousArg;
      },
    }),
    markMessagesAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/message/read/${id}`,
        method: "PUT",
      }),
      onQueryStarted: (id, { dispatch }) => {
        // Update the cache optimistically
        dispatch(
          messageApi.util.updateQueryData("getMessages", { userId: id }, (draft) => {
            // Mark all messages from this user as read
            draft.data.forEach((message) => {
              if (message.senderId === id) {
                message.read = true;
              }
            });
          }),
        );
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useSendMessageMutation,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
} = messageApi;
