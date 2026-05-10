import { emptySplitApi } from "./empty-split-api";
import type { Conversation, User } from "@/types";

type ConversationsResponse = {
  success: boolean;
  data: Conversation[];
};

type ConversationResponse = {
  success: boolean;
  data: Conversation;
};

type UsersResponse = {
  success: boolean;
  data: User[];
};

export const conversationApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => ({ url: "/conversations" }),
      providesTags: ["Conversations"],
    }),
    getOrCreateDM: builder.mutation<ConversationResponse, { userId: string }>({
      query: (data) => ({
        url: "/conversations/dm",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conversations"],
    }),
    createGroup: builder.mutation<
      ConversationResponse,
      { name: string; memberIds: string[]; avatar?: string }
    >({
      query: (data) => ({
        url: "/conversations/group",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Conversations"],
    }),
    updateGroup: builder.mutation<
      ConversationResponse,
      { id: string; name?: string; avatar?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/conversations/group/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Conversations"],
    }),
    addMembers: builder.mutation<
      ConversationResponse,
      { id: string; memberIds: string[] }
    >({
      query: ({ id, memberIds }) => ({
        url: `/conversations/group/${id}/members`,
        method: "PUT",
        body: { memberIds },
      }),
      invalidatesTags: ["Conversations"],
    }),
    removeMember: builder.mutation<
      ConversationResponse,
      { id: string; userId: string }
    >({
      query: ({ id, userId }) => ({
        url: `/conversations/group/${id}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conversations"],
    }),
    leaveGroup: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/conversations/group/${id}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Conversations"],
    }),
    // Get all users for member selection
    getAllUsers: builder.query<UsersResponse, void>({
      query: () => ({ url: "/users" }),
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetOrCreateDMMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useAddMembersMutation,
  useRemoveMemberMutation,
  useLeaveGroupMutation,
} = conversationApi;
