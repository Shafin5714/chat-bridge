import { emptySplitApi } from "./emptySplitApi";

export const userApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useUpdateProfileMutation } = userApi;
