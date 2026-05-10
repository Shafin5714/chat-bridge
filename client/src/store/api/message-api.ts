import { emptySplitApi } from "./empty-split-api";
import type { Message, PaginatedMessagesResponse } from "@/types";

export type SendMessageRequest = {
  conversationId: string;
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
    sendMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: (data) => ({
        url: `/message/send/${data.conversationId}`,
        method: "POST",
        body: {
          text: data.text,
          image: data.image,
        },
      }),
    }),
    getMessages: builder.query<
      PaginatedMessagesResponse,
      { conversationId: string; cursor?: string | null; newerCursor?: string | null; around?: string | null }
    >({
      query: ({ conversationId, cursor, newerCursor, around }) => ({
        url: `/message/${conversationId}`,
        params: {
          ...(cursor ? { cursor } : {}),
          ...(newerCursor ? { newerCursor } : {}),
          ...(around ? { around } : {}),
          limit: 30,
        },
      }),
      providesTags: ["Message"],
      serializeQueryArgs: ({ queryArgs }) => queryArgs.conversationId,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.around) {
          return newItems;
        }
        if (arg.newerCursor) {
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
    searchMessages: builder.query<
      GetMessagesResponse,
      { conversationId: string; q: string }
    >({
      query: ({ conversationId, q }) => ({
        url: `/message/search/${conversationId}?q=${encodeURIComponent(q)}`,
      }),
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useLazySearchMessagesQuery,
} = messageApi;
