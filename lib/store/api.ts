import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Staff sessions live in localStorage (separate auth path from NextAuth).
// We prefer the staff token when present so kitchen / delivery / staff-admin
// accounts hit the backend as themselves from admin / staff pages alike.
const STAFF_STORAGE_KEY = 'harke_staff_session';
function readStaffToken(): string | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed?.token === 'string' ? parsed.token : null;
    } catch {
        return null;
    }
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: async (headers) => {
            const staffToken = readStaffToken();
            if (staffToken) {
                headers.set('authorization', `Bearer ${staffToken}`);
                return headers;
            }
            const session = await getSession();
            if (session && (session as any).accessToken) {
                headers.set('authorization', `Bearer ${(session as any).accessToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'Category', 'Food', 'Order', 'Review', 'Settings', 'Hours', 'Holiday', 'Cart', 'ContactInfo', 'Staff'],
    endpoints: (builder) => ({
        // Auth
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),
        updateUser: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        whoami: builder.query({
            query: () => '/auth/whoami',
            providesTags: ['User'],
        }),
        getActiveSessions: builder.query({
            query: () => '/auth/sessions',
            providesTags: ['User'],
        }),
        logout: builder.mutation({
            query: (tokenId?: string) => ({
                url: '/auth/logout',
                method: 'POST',
                body: { tokenId },
            }),
            invalidatesTags: ['User'],
        }),
        logoutAll: builder.mutation({
            query: () => ({
                url: '/auth/logout-all',
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Cart'], // Clear cart on logout
        }),

        // Cart
        getCart: builder.query({
            query: () => '/cart',
            providesTags: ['Cart'],
        }),
        addToCart: builder.mutation({
            query: (data) => ({
                url: '/cart',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Cart'],
        }),
        updateCartItem: builder.mutation({
            query: ({ id, quantity }) => ({
                url: `/cart/${id}`,
                method: 'PATCH',
                body: { quantity },
            }),
            invalidatesTags: ['Cart'],
        }),
        removeFromCart: builder.mutation({
            query: (id) => ({
                url: `/cart/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),
        clearCart: builder.mutation({
            query: () => ({
                url: '/cart',
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),


        // Catalog
        getCategories: builder.query({
            query: () => '/categories',
            providesTags: ['Category'],
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: '/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/categories/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
        getFoodItems: builder.query({
            query: () => '/food',
            providesTags: ['Food'],
        }),
        createFoodItem: builder.mutation({
            query: (data) => ({
                url: '/food',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Food'],
        }),
        updateFoodItem: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/food/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Food'],
        }),
        deleteFoodItem: builder.mutation({
            query: (id) => ({
                url: `/food/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Food'],
        }),
        getFoodItem: builder.query({
            query: (id) => `/food/${id}`,
            providesTags: (result, error, id) => [{ type: 'Food', id }],
        }),
        getFoodItemBySlug: builder.query({
            query: (slug) => `/food/by-slug/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Food', id: slug }],
        }),

        // Orders
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: '/orders',
                method: 'POST',
                body: orderData,
            }),
            invalidatesTags: ['Order'],
        }),
        getOrders: builder.query({
            query: () => '/orders',
            providesTags: ['Order'],
        }),
        getAdminOrders: builder.query({
            query: () => '/orders/all',
            providesTags: ['Order'],
        }),
        getOrder: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: (result, error, id) => [{ type: 'Order', id }],
        }),
        verifyPayment: builder.mutation({
            query: (data) => ({
                url: '/orders/verify-payment',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order', 'Cart'],
        }),
        retryPayment: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/retry-payment`,
                method: 'POST',
            }),
        }),

        // Addresses
        getAddresses: builder.query({
            query: (userId) => `/addresses/user/${userId}`,
            providesTags: ['User'],
        }),
        createAddress: builder.mutation({
            query: (addressData) => ({
                url: '/addresses',
                method: 'POST',
                body: addressData,
            }),
            invalidatesTags: ['User'],
        }),
        updateAddress: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/addresses/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        deleteAddress: builder.mutation({
            query: (id) => ({
                url: `/addresses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),

        // Dashboard
        getStats: builder.query({
            query: () => '/dashboard/stats',
        }),
        getDashboardRecentOrders: builder.query({
            query: () => '/dashboard/recent-orders',
        }),

        // Settings / Config
        getHours: builder.query({
            query: () => '/hours',
            providesTags: ['Hours'],
        }),
        updateHours: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/hours/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Hours'],
        }),
        getRestaurantStatus: builder.query({
            query: () => '/hours/status',
            providesTags: ['Hours'],
        }),
        getNextOpenTime: builder.query({
            query: () => '/hours/next-open',
            providesTags: ['Hours'],
        }),
        getRestaurantSettings: builder.query({
            query: () => '/admin/settings',
            providesTags: ['Settings'],
        }),
        updateRestaurantSettings: builder.mutation({
            query: (data) => ({
                url: '/admin/settings',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
        getTemporaryClosedStatus: builder.query({
            query: () => '/settings',
            providesTags: ['Settings'],
        }),
        updateTemporaryClosedStatus: builder.mutation({
            query: (data) => ({
                url: '/settings/status',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Settings', 'Hours'],
        }),
        // Holidays
        getHolidays: builder.query({
            query: () => '/admin/holidays',
            providesTags: ['Holiday'],
        }),
        getHoliday: builder.query({
            query: (date) => `/admin/holidays/${date}`,
            providesTags: (result, error, date) => [{ type: 'Holiday', id: date }],
        }),
        createHoliday: builder.mutation({
            query: (data) => ({
                url: '/admin/holidays',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Holiday'],
        }),
        updateHoliday: builder.mutation({
            query: ({ date, ...data }) => ({
                url: `/admin/holidays/${date}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Holiday'],
        }),
        deleteHoliday: builder.mutation({
            query: (date) => ({
                url: `/admin/holidays/${date}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Holiday'],
        }),
        // Contact Info
        getContactInfo: builder.query({
            query: () => '/contact-info',
            providesTags: ['ContactInfo'],
        }),
        updateContactInfo: builder.mutation({
            query: (data) => ({
                url: '/admin/contact-info',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['ContactInfo'],
        }),
        // Staff
        getStaff: builder.query({
            query: () => '/staff',
            providesTags: ['Staff'],
        }),
        createStaff: builder.mutation({
            query: (data) => ({
                url: '/staff',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Staff'],
        }),

        // Order Logs
        getOrderLogs: builder.query({
            query: (id) => `/orders/${id}/logs`,
            providesTags: (result, error, id) => [{ type: 'Order', id }],
        }),
    }),
});

export const {
    useRegisterMutation,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useGetFoodItemsQuery,
    useCreateFoodItemMutation,
    useUpdateFoodItemMutation,
    useDeleteFoodItemMutation,
    useGetFoodItemQuery,
    useGetFoodItemBySlugQuery,
    useCreateOrderMutation,
    useGetOrdersQuery,
    useGetAdminOrdersQuery,
    useGetOrderQuery,
    useVerifyPaymentMutation,
    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useUpdateUserMutation,
    useGetStatsQuery,
    useGetDashboardRecentOrdersQuery,
    useGetHoursQuery,
    useUpdateHoursMutation,
    useGetRestaurantStatusQuery,
    useGetNextOpenTimeQuery,
    useGetRestaurantSettingsQuery,
    useUpdateRestaurantSettingsMutation,
    useGetTemporaryClosedStatusQuery,
    useUpdateTemporaryClosedStatusMutation,
    useGetHolidaysQuery,
    useGetHolidayQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation,
    useWhoamiQuery,
    useGetActiveSessionsQuery,
    useLogoutMutation,
    useLogoutAllMutation,
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    useGetContactInfoQuery,
    useUpdateContactInfoMutation,
    useRetryPaymentMutation,
    useGetStaffQuery,
    useCreateStaffMutation,
    useGetOrderLogsQuery,
    useLazyGetOrderLogsQuery,
} = apiSlice;

