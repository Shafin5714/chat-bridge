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
      { userId: string; cursor?: string | null; newerCursor?: string | null; around?: string | null }
    >({
      query: ({ userId, cursor, newerCursor, around }) => ({
        url: `/message/${userId}`,
        params: { ...(cursor ? { cursor } : {}), ...(newerCursor ? { newerCursor } : {}), ...(around ? { around } : {}), limit: 30 },
      }),
      providesTags: ["Message"],
      serializeQueryArgs: ({ queryArgs }) => queryArgs.userId,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.around) {
          // Replace cache when jumping
          return newItems;
        }
        if (arg.newerCursor) {
          // Append to bottom
          return {
            ...newItems,
            data: [...currentCache.data, ...newItems.data],
            pagination: {
              ...currentCache.pagination,
              newerCursor: newItems.pagination.newerCursor,
              hasMoreNewer: newItems.pagination.hasMoreNewer,
            },
          };
        }
        if (arg.cursor) {
          // Prepend to top
          return {
            ...newItems,
            data: [...newItems.data, ...currentCache.data],
            pagination: {
              ...currentCache.pagination,
              olderCursor: newItems.pagination.olderCursor,
              hasMoreOlder: newItems.pagination.hasMoreOlder,
            },
          };
        }
        return newItems;
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
    searchMessages: builder.query<
      GetMessagesResponse,
      { userId: string; q: string }
    >({
      query: ({ userId, q }) => ({
        url: `/message/search/${userId}?q=${encodeURIComponent(q)}`,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useSendMessageMutation,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
  useLazySearchMessagesQuery,
} = messageApi;
