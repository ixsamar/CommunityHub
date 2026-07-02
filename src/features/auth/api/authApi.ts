import {baseApi} from '../../../common/api/baseApi';
import {AuthResponse} from '../types';

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, Record<string, string>>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {useLoginMutation} = authApi;
