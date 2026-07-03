import NetInfo from '@react-native-community/netinfo';
import {NetworkResult} from '../repository';
import {
  Community,
  CommunityQueryParams,
  PaginatedResponse,
  CreateCommunityRequest,
} from '../../Constance/globalTypes';
import {axiosInstance} from '../httpClient';
import {StorageRepository} from '../offline/StorageRepository';
import {QueueManager} from '../offline/QueueManager';
import {Logger} from '../../Utils/logger';

export interface ICommunityRepository {
  getCommunities(params: CommunityQueryParams): NetworkResult<PaginatedResponse<Community>>;
  getCommunityById(id: string): NetworkResult<Community>;
  joinCommunity(id: string): NetworkResult<Community>;
  leaveCommunity(id: string): NetworkResult<Community>;
  createCommunity(community: CreateCommunityRequest): NetworkResult<Community>;
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
    const cacheKey = this.getCacheKey(params);
    try {
      const netInfo = await NetInfo.fetch();
      const cached = StorageRepository.get<PaginatedResponse<Community>>(cacheKey);

      if (!netInfo.isConnected) {
        if (cached) {
          Logger.info(
            `Offline read successful for communities list: ${cacheKey}`,
            'CommunityRepository',
          );
          return {data: cached};
        }
        return {
          error: {
            code: 'OFFLINE_NO_CACHE',
            message: 'You are offline, and no cached data was found for this filter.',
          },
        };
      }

      if (cached) {
        if (!StorageRepository.isStale(cacheKey)) {
          Logger.debug(`Fresh cache hit for key: ${cacheKey}`, 'CommunityRepository');
          return {data: cached};
        }
        Logger.info(
          `Stale cache detected. Triggering background revalidation for: ${cacheKey}`,
          'CommunityRepository',
        );

        this.fetchAndCacheCommunities(params, cacheKey).catch(error => {
          Logger.error(
            `Background communities revalidation failed for: ${cacheKey}`,
            'CommunityRepository',
            error,
          );
        });

        return {data: cached};
      }

      const data = await this.fetchAndCacheCommunities(params, cacheKey);
      return {data};
    } catch (error: unknown) {
      const cached = StorageRepository.get<PaginatedResponse<Community>>(cacheKey);
      if (cached) {
        Logger.warn(
          `Online fetch failed, falling back to cache: ${cacheKey}`,
          'CommunityRepository',
        );
        return {data: cached};
      }
      const err = error as Error;
      return {
        error: {
          code: 'FETCH_COMMUNITIES_FAILED',
          message: err.message || 'Failed to fetch communities list',
        },
      };
    }
  }

  private async fetchAndCacheCommunities(
    params: CommunityQueryParams,
    cacheKey: string,
  ): Promise<PaginatedResponse<Community>> {
    const response = await axiosInstance.get<PaginatedResponse<Community>>('/communities', {
      params,
    });

    StorageRepository.set(cacheKey, response.data, 300);

    try {
      const {store} = await import('../../Store/store');
      const {communityApi} = await import('./communityApi');
      store.dispatch(
        communityApi.util.updateQueryData('getCommunities', params, () => {
          return response.data;
        }),
      );
    } catch (err) {
      Logger.error(
        'Failed to dispatch background store update for communities',
        'CommunityRepository',
        err,
      );
    }

    return response.data;
  }

  public async getCommunityById(id: string): NetworkResult<Community> {
    const cacheKey = `community_detail_${id}`;
    try {
      const netInfo = await NetInfo.fetch();
      const cached = StorageRepository.get<Community>(cacheKey);

      if (!netInfo.isConnected) {
        if (cached) {
          Logger.info(
            `Offline read successful for community detail: ${cacheKey}`,
            'CommunityRepository',
          );
          return {data: cached};
        }
        return {
          error: {
            code: 'OFFLINE_NO_CACHE',
            message: 'You are offline, and details for this community are not cached.',
          },
        };
      }

      if (cached) {
        if (!StorageRepository.isStale(cacheKey)) {
          Logger.debug(`Fresh cache hit for key: ${cacheKey}`, 'CommunityRepository');
          return {data: cached};
        }
        Logger.info(
          `Stale detail cache. Triggering background revalidation for: ${cacheKey}`,
          'CommunityRepository',
        );

        this.fetchAndCacheCommunityById(id, cacheKey).catch(error => {
          Logger.error(
            `Background community detail revalidation failed for: ${cacheKey}`,
            'CommunityRepository',
            error,
          );
        });

        return {data: cached};
      }

      const data = await this.fetchAndCacheCommunityById(id, cacheKey);
      return {data};
    } catch (error: unknown) {
      const cached = StorageRepository.get<Community>(cacheKey);
      if (cached) {
        Logger.warn(
          `Online fetch failed, falling back to detail cache: ${cacheKey}`,
          'CommunityRepository',
        );
        return {data: cached};
      }
      const err = error as Error;
      return {
        error: {
          code: 'FETCH_COMMUNITY_FAILED',
          message: err.message || 'Failed to fetch community details',
        },
      };
    }
  }

  private async fetchAndCacheCommunityById(id: string, cacheKey: string): Promise<Community> {
    const response = await axiosInstance.get<Community>(`/communities/${id}`);

    StorageRepository.set(cacheKey, response.data, 600);

    try {
      const {store} = await import('../../Store/store');
      const {communityApi} = await import('./communityApi');
      store.dispatch(
        communityApi.util.updateQueryData('getCommunityById', id, () => {
          return response.data;
        }),
      );
    } catch (err) {
      Logger.error(
        'Failed to dispatch background store update for community detail',
        'CommunityRepository',
        err,
      );
    }

    return response.data;
  }

  public async joinCommunity(id: string): NetworkResult<Community> {
    const cacheKey = `community_detail_${id}`;
    try {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        QueueManager.enqueue('JOIN', {communityId: id});

        const cached = StorageRepository.get<Community>(cacheKey);
        let updated: Community;
        if (cached) {
          updated = {
            ...cached,
            isJoined: true,
            members: cached.members + 1,
          };
        } else {
          updated = {
            id,
            name: 'Joined Community',
            description: '',
            members: 1,
            isJoined: true,
            isPrivate: false,
            createdAt: new Date().toISOString(),
          };
        }

        StorageRepository.set(cacheKey, updated, 600);
        Logger.info(`Enqueued community join offline for community: ${id}`, 'CommunityRepository');

        return {
          data: updated,
          error: {
            code: 'OFFLINE_QUEUED',
            message: 'Network offline. Action queued and will sync automatically.',
          },
        };
      }

      const response = await axiosInstance.post<Community>(`/communities/${id}/join`);
      StorageRepository.clearCachePattern('communities_cache_');
      StorageRepository.set(cacheKey, response.data, 600);
      return {data: response.data};
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
    const cacheKey = `community_detail_${id}`;
    try {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        QueueManager.enqueue('LEAVE', {communityId: id});

        const cached = StorageRepository.get<Community>(cacheKey);
        let updated: Community;
        if (cached) {
          updated = {
            ...cached,
            isJoined: false,
            members: Math.max(0, cached.members - 1),
          };
        } else {
          updated = {
            id,
            name: 'Community',
            description: '',
            members: 0,
            isJoined: false,
            isPrivate: false,
            createdAt: new Date().toISOString(),
          };
        }

        StorageRepository.set(cacheKey, updated, 600);
        Logger.info(`Enqueued community leave offline for community: ${id}`, 'CommunityRepository');

        return {
          data: updated,
          error: {
            code: 'OFFLINE_QUEUED',
            message: 'Network offline. Action queued and will sync automatically.',
          },
        };
      }

      const response = await axiosInstance.post<Community>(`/communities/${id}/leave`);
      StorageRepository.clearCachePattern('communities_cache_');
      StorageRepository.set(cacheKey, response.data, 600);
      return {data: response.data};
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

  public async createCommunity(community: CreateCommunityRequest): NetworkResult<Community> {
    try {
      const netInfo = await NetInfo.fetch();
      const tempId = `community_${Date.now()}`;

      if (!netInfo.isConnected) {
        QueueManager.enqueue('CREATE_COMMUNITY', {
          communityData: {...community, id: tempId},
        });

        const optimisticCommunity: Community = {
          id: tempId,
          name: community.name,
          description: community.description,
          members: 1,
          isPrivate: community.isPrivate,
          createdAt: new Date().toISOString(),
          isJoined: true,
        };

        StorageRepository.set(`community_detail_${tempId}`, optimisticCommunity, 600);
        Logger.info(
          `Enqueued community creation offline: ${community.name}`,
          'CommunityRepository',
        );

        return {
          data: optimisticCommunity,
          error: {
            code: 'OFFLINE_QUEUED',
            message: 'Network offline. Community creation queued and will sync automatically.',
          },
        };
      }

      const response = await axiosInstance.post<Community>('/communities', community);
      StorageRepository.clearCachePattern('communities_cache_');
      StorageRepository.set(`community_detail_${response.data.id}`, response.data, 600);
      return {data: response.data};
    } catch (error: unknown) {
      const err = error as Error;
      return {
        error: {
          code: 'CREATE_COMMUNITY_FAILED',
          message: err.message || 'Failed to create community',
        },
      };
    }
  }
}
