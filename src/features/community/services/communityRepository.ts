import NetInfo from '@react-native-community/netinfo';
import {NetworkResult} from '../../../common/api/repository';
import {Community, CommunityQueryParams, PaginatedResponse} from '../types';
import {httpClient} from '../../../common/api/httpClient';
import {storage} from '../../../common/storage/mmkv';

export interface ICommunityRepository {
  getCommunities(params: CommunityQueryParams): NetworkResult<PaginatedResponse<Community>>;
  getCommunityById(id: string): NetworkResult<Community>;
  joinCommunity(id: string): NetworkResult<Community>;
  leaveCommunity(id: string): NetworkResult<Community>;
}

export class CommunityRepository implements ICommunityRepository {
  private getCacheKey(params: CommunityQueryParams): string {
    const search = params.search || '';
    const sort = params.sort || 'name';
    const filter = params.filter || 'all';
    const page = params.page || 1;
    return `communities_cache_${search}_${sort}_${filter}_p${page}`;
  }

  public async getCommunities(
    params: CommunityQueryParams,
  ): NetworkResult<PaginatedResponse<Community>> {
    try {
      const netInfo = await NetInfo.fetch();
      
      // Cache-first fallback if offline
      if (!netInfo.isConnected) {
        const cacheKey = this.getCacheKey(params);
        const cachedData = storage.getString(cacheKey);
        
        if (cachedData) {
          try {
            const data = JSON.parse(cachedData) as PaginatedResponse<Community>;
            return { data };
          } catch {
            // If cache corrupted, proceed to let error fall through
          }
        }
        
        return {
          error: {
            code: 'OFFLINE_NO_CACHE',
            message: 'You are offline, and no cached data was found for this filter.',
          },
        };
      }

      // Online: Fetch from Mock HTTP Server
      const response = await httpClient.get<PaginatedResponse<Community>>('/communities', {
        params,
      });

      // Save to MMKV Cache for offline capability
      const cacheKey = this.getCacheKey(params);
      storage.set(cacheKey, JSON.stringify(response.data));

      return { data: response.data };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'FETCH_COMMUNITIES_FAILED',
          message: err.message || 'Failed to fetch communities list',
        },
      };
    }
  }

  public async getCommunityById(id: string): NetworkResult<Community> {
    try {
      const netInfo = await NetInfo.fetch();
      const cacheKey = `community_detail_${id}`;

      if (!netInfo.isConnected) {
        const cached = storage.getString(cacheKey);
        if (cached) {
          return { data: JSON.parse(cached) as Community };
        }
        return {
          error: {
            code: 'OFFLINE_NO_CACHE',
            message: 'You are offline, and details for this community are not cached.',
          },
        };
      }

      const response = await httpClient.get<Community>(`/communities/${id}`);
      storage.set(cacheKey, JSON.stringify(response.data));

      return { data: response.data };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'FETCH_COMMUNITY_FAILED',
          message: err.message || 'Failed to fetch community details',
        },
      };
    }
  }

  public async joinCommunity(id: string): NetworkResult<Community> {
    try {
      const response = await httpClient.post<Community>(`/communities/${id}/join`);
      
      // Update details cache immediately
      storage.set(`community_detail_${id}`, JSON.stringify(response.data));
      
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'JOIN_COMMUNITY_FAILED',
          message: err.message || 'Failed to join the community',
        },
      };
    }
  }

  public async leaveCommunity(id: string): NetworkResult<Community> {
    try {
      const response = await httpClient.post<Community>(`/communities/${id}/leave`);
      
      // Update details cache immediately
      storage.set(`community_detail_${id}`, JSON.stringify(response.data));

      return { data: response.data };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'LEAVE_COMMUNITY_FAILED',
          message: err.message || 'Failed to leave the community',
        },
      };
    }
  }
}
