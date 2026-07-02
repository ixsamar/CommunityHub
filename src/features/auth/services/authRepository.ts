/* eslint-disable @typescript-eslint/no-explicit-any */
import { NetworkResult } from '../../../common/api/repository';
import { AuthResponse, User } from '../types';
import { secureStorage } from '../../../common/storage/mmkv';
import { httpClient } from '../../../common/api/httpClient';

export interface IAuthRepository {
  login(credentials: Record<string, string>): NetworkResult<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(refreshToken: string): NetworkResult<AuthResponse>;
}

export class AuthRepository implements IAuthRepository {
  /**
   * Submits user credentials to perform standard login.
   */
  public async login(credentials: Record<string, string>): NetworkResult<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse & { refreshToken: string }>('/auth/login', credentials);
      
      // Persist credentials securely
      secureStorage.setString('auth_token', response.data.token);
      if (response.data.refreshToken) {
        secureStorage.setString('auth_refresh_token', response.data.refreshToken);
      }
      secureStorage.setString('auth_user', JSON.stringify(response.data.user));
      
      return { data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication failed.';
      return {
        error: {
          code: 'AUTH_FAILED',
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Refreshes the expired access token using the stored refresh token.
   */
  public async refreshToken(refreshToken: string): NetworkResult<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse & { refreshToken: string }>('/auth/refresh', {
        refreshToken,
      });

      secureStorage.setString('auth_token', response.data.token);
      if (response.data.refreshToken) {
        secureStorage.setString('auth_refresh_token', response.data.refreshToken);
      }
      secureStorage.setString('auth_user', JSON.stringify(response.data.user));

      return { data: response.data };
    } catch (error: any) {
      return {
        error: {
          code: 'REFRESH_FAILED',
          message: error.message || 'Token refresh failed.',
        },
      };
    }
  }

  /**
   * Revokes tokens and clears secure storage data.
   */
  public async logout(): Promise<void> {
    secureStorage.delete('auth_token');
    secureStorage.delete('auth_refresh_token');
    secureStorage.delete('auth_user');
  }

  /**
   * Recovers user profile metadata from local secure storage.
   */
  public async getCurrentUser(): Promise<User | null> {
    const userStr = secureStorage.getString('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}
