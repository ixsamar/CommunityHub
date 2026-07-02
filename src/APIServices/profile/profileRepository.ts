import {NetworkResult} from '../repository';
import {UserProfile} from '../../Constance/globalTypes';
import {axiosInstance} from '../httpClient';

export interface IProfileRepository {
  getProfile(userId: string): NetworkResult<UserProfile>;
  updateProfile(userId: string, data: Partial<UserProfile>): NetworkResult<UserProfile>;
}

export class ProfileRepository implements IProfileRepository {
  public async getProfile(userId: string): NetworkResult<UserProfile> {
    try {
      const response = await axiosInstance.get<UserProfile>(`/profile/${userId}`);
      return {data: response.data};
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'FETCH_PROFILE_FAILED',
          message: err.message || 'Failed to fetch profile',
        },
      };
    }
  }

  public async updateProfile(
    userId: string,
    data: Partial<UserProfile>,
  ): NetworkResult<UserProfile> {
    try {
      const response = await axiosInstance.put<UserProfile>(`/profile/${userId}`, data);
      return {data: response.data};
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'UPDATE_PROFILE_FAILED',
          message: err.message || 'Failed to update profile',
        },
      };
    }
  }
}
