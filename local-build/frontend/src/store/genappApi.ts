import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Customer, Policy, Claim, CreatePolicyInput } from '../types';

type CustomerInput = Partial<Omit<Customer, 'customer_num' | 'num_policies'>>;

interface CreateCustomerResult { customer_num: string; message: string }
interface CreatePolicyResult   { policy_num:   string; message: string }
interface CreateClaimResult    { claim_num:    string; message: string }
interface MessageResult        { message: string }

interface GetPolicyArg    { custId: string; polNum: string; polType: string }
interface DeletePolicyArg { custId: string; polNum: string; polType: string }
interface UpdateCustomerArg { id: string; data: CustomerInput }

export const genappApi = createApi({
  reducerPath: 'genappApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Customer', 'Policy', 'Claim'],
  endpoints: (builder) => ({

    // ── Customers ────────────────────────────────────────────────────────────
    listCustomers: builder.query<Customer[], void>({
      query: () => '/customers',
      providesTags: (result) =>
        result
          ? [...result.map(c => ({ type: 'Customer' as const, id: c.customer_num })), { type: 'Customer' as const, id: 'LIST' }]
          : [{ type: 'Customer' as const, id: 'LIST' }],
    }),

    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Customer' as const, id }],
    }),

    createCustomer: builder.mutation<CreateCustomerResult, CustomerInput>({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    updateCustomer: builder.mutation<MessageResult, UpdateCustomerArg>({
      query: ({ id, data }) => ({ url: `/customers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Customer' as const, id },
        { type: 'Customer' as const, id: 'LIST' },
      ],
    }),

    deleteCustomer: builder.mutation<MessageResult, string>({
      query: (id) => ({ url: `/customers/${id}`, method: 'DELETE' }),
      // Customer delete cascades to policies and claims in the DB
      invalidatesTags: (_r, _e, id) => [
        { type: 'Customer' as const, id },
        { type: 'Customer' as const, id: 'LIST' },
        { type: 'Policy'   as const, id: 'LIST' },
        { type: 'Claim'    as const, id: 'LIST' },
      ],
    }),

    // ── Policies ─────────────────────────────────────────────────────────────
    listPolicies: builder.query<Policy[], string | undefined>({
      query: (custNum) => custNum ? `/policies?cust_num=${custNum}` : '/policies',
      providesTags: (result) =>
        result
          ? [...result.map(p => ({ type: 'Policy' as const, id: p.policy_num })), { type: 'Policy' as const, id: 'LIST' }]
          : [{ type: 'Policy' as const, id: 'LIST' }],
    }),

    getPolicy: builder.query<Policy, GetPolicyArg>({
      query: ({ custId, polNum, polType }) =>
        `/policies/customer/${custId}?policy_num=${polNum}&policy_type=${polType}`,
      providesTags: (_r, _e, { polNum }) => [{ type: 'Policy' as const, id: polNum }],
    }),

    createPolicy: builder.mutation<CreatePolicyResult, CreatePolicyInput>({
      query: (body) => ({ url: '/policies', method: 'POST', body }),
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }],
    }),

    deletePolicy: builder.mutation<MessageResult, DeletePolicyArg>({
      query: ({ custId, polNum, polType }) => ({
        url: `/policies/customer/${custId}/${polNum}?policy_type=${polType}`,
        method: 'DELETE',
      }),
      // Policy delete cascades to claims in the DB
      invalidatesTags: (_r, _e, { polNum }) => [
        { type: 'Policy' as const, id: polNum },
        { type: 'Policy' as const, id: 'LIST' },
        { type: 'Claim'  as const, id: 'LIST' },
      ],
    }),

    // ── Claims ───────────────────────────────────────────────────────────────
    listClaims: builder.query<Claim[], string | undefined>({
      query: (polNum) => polNum ? `/claims?policy_num=${polNum}` : '/claims',
      providesTags: (result) =>
        result
          ? [...result.map(c => ({ type: 'Claim' as const, id: c.claim_num })), { type: 'Claim' as const, id: 'LIST' }]
          : [{ type: 'Claim' as const, id: 'LIST' }],
    }),

    getClaim: builder.query<Claim, string>({
      query: (claimNum) => `/claims/${claimNum}`,
      providesTags: (_r, _e, claimNum) => [{ type: 'Claim' as const, id: claimNum }],
    }),

    createClaim: builder.mutation<CreateClaimResult, Omit<Claim, 'claim_num'>>({
      query: (body) => ({ url: '/claims', method: 'POST', body }),
      invalidatesTags: [{ type: 'Claim', id: 'LIST' }],
    }),

    deleteClaim: builder.mutation<MessageResult, string>({
      query: (claimNum) => ({ url: `/claims/${claimNum}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, claimNum) => [
        { type: 'Claim' as const, id: claimNum },
        { type: 'Claim' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListCustomersQuery,
  useGetCustomerQuery,
  useLazyGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useListPoliciesQuery,
  useGetPolicyQuery,
  useLazyGetPolicyQuery,
  useCreatePolicyMutation,
  useDeletePolicyMutation,
  useListClaimsQuery,
  useGetClaimQuery,
  useLazyGetClaimQuery,
  useCreateClaimMutation,
  useDeleteClaimMutation,
} = genappApi;
