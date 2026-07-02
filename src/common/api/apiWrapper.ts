/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig, AxiosError } from 'axios';
import { httpClient } from './httpClient';
import { RepositoryResult } from './repository';

export const apiWrapper = {
  /**
   * Performs a type-safe API request and maps results or errors to RepositoryResult.
   */
  request: async <T>(config: AxiosRequestConfig): Promise<RepositoryResult<T>> => {
    try {
      const response = await httpClient.request<T>(config);
      return { data: response.data };
    } catch (error) {
      const err = error as AxiosError<{ message?: string; code?: string }>;
      
      // Standardize the error response format
      const errorCode = err.response?.data?.code || err.code || 'API_ERROR';
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'An unexpected network error occurred.';

      return {
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
    }
  },

  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiWrapper.request<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiWrapper.request<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiWrapper.request<T>({ ...config, method: 'PUT', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiWrapper.request<T>({ ...config, method: 'DELETE', url }),
};
