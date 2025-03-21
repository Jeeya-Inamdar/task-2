import { apiSlice } from "../apiSlice";

const USER_URL = "/user";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => ({
        url: `${USER_URL}/notifications`,
        method: "GET",
        credentials: "include",
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/register`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${USER_URL}/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),

    markNotificationRead: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/read-noti?isReadType=${data.type}&id=${data.id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/profile`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    ChangePassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/change-password`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    getTeamList: builder.query({
      query: () => ({
        url: `${USER_URL}/get-team`,
        method: "GET",
        credentials: "include",
      }),
    }),
    userAction: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/${data.id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),

    promoteToAdmin: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/promote-to-admin`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Users"], // Add this to invalidate cache
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/forgotpassword`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/changepassword/${data.resetToken}`,
        method: "POST",
        body: { password: data.password },
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useRegisterMutation,
  useGetTeamListQuery,
  useDeleteUserMutation,
  useUserActionMutation,
  usePromoteToAdminMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userApiSlice;
