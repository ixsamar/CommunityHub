import {baseApi} from '../baseApi';
import {AuthResponse} from '../../Constance/globalTypes';

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
