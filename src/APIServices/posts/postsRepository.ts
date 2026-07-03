import NetInfo from '@react-native-community/netinfo';
import {NetworkResult} from '../repository';
import {Post, CreatePostRequest} from '../../Constance/globalTypes';
import {axiosInstance} from '../httpClient';
import {StorageRepository} from '../offline/StorageRepository';
import {QueueManager} from '../offline/QueueManager';
import {Logger} from '../../Utils/logger';

export interface IPostsRepository {
  getPosts(params: {communityId?: string; page?: number; limit?: number}): NetworkResult<Post[]>;
  createPost(post: CreatePostRequest): NetworkResult<Post>;
  getPostById(id: string): NetworkResult<Post>;
  updatePost(id: string, post: CreatePostRequest): NetworkResult<Post>;
  deletePost(id: string): NetworkResult<void>;
}

export class PostsRepository implements IPostsRepository {
  private getCacheKey(communityId?: string, page?: number): string {
    return `posts_cache_${communityId || 'all'}_p${page || 1}`;
  }

  public async getPosts(params: {communityId?: string; page?: number; limit?: number}): NetworkResult<Post[]> {
    const cacheKey = this.getCacheKey(params.communityId, params.page);
    try {
      const netInfo = await NetInfo.fetch();
      const rawCached = StorageRepository.get<any>(cacheKey);
      const cached = rawCached ? (Array.isArray(rawCached) ? rawCached : rawCached.data || []) : null;

      if (!netInfo.isConnected) {
        if (cached) {
          Logger.info(`Offline read successful for key: ${cacheKey}`, 'PostsRepository');
          return {data: cached};
        }
        return {
          error: {
            code: 'OFFLINE_NO_CACHE',
            message: 'You are offline, and no cached posts were found for this feed.',
          },
        };
      }

      if (cached) {
        if (!StorageRepository.isStale(cacheKey)) {
          Logger.debug(`Fresh posts cache hit for key: ${cacheKey}`, 'PostsRepository');
          return {data: cached};
        }
        Logger.info(
          `Stale posts cache. Triggering background revalidation for: ${cacheKey}`,
          'PostsRepository',
        );

        this.fetchAndCachePosts(params, cacheKey).catch(error => {
          Logger.error(
            `Background posts revalidation failed for: ${cacheKey}`,
            'PostsRepository',
            error,
          );
        });

        return {data: cached};
      }

      const data = await this.fetchAndCachePosts(params, cacheKey);
      return {data};
    } catch (error: unknown) {
      const rawCached = StorageRepository.get<any>(cacheKey);
      const cached = rawCached ? (Array.isArray(rawCached) ? rawCached : rawCached.data || []) : null;
      if (cached) {
        Logger.warn(`Online fetch failed, falling back to cache: ${cacheKey}`, 'PostsRepository');
        return {data: cached};
      }

      const err = error as Error;
      return {
        error: {
          code: 'FETCH_POSTS_FAILED',
          message: err.message || 'Failed to fetch posts',
        },
      };
    }
  }

  private async fetchAndCachePosts(
    params: {communityId?: string; page?: number; limit?: number},
    cacheKey: string,
  ): Promise<Post[]> {
    const response = await axiosInstance.get<any>('/posts', {params});
    const postsArray = Array.isArray(response.data)
      ? response.data
      : response.data?.data || [];

    StorageRepository.set(cacheKey, postsArray, 120);

    try {
      const {store} = await import('../../Store/store');
      const {postsApi} = await import('./postsApi');
      store.dispatch(
        postsApi.util.updateQueryData('getPosts', params, () => {
          return postsArray;
        }),
      );
    } catch (err) {
      Logger.error('Failed to dispatch background store update for posts', 'PostsRepository', err);
    }

    return postsArray;
  }

  public async createPost(post: CreatePostRequest): NetworkResult<Post> {
    const tempId = post.clientPostId || `opt_${Date.now()}`;
    try {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        StorageRepository.clearCachePattern('posts_cache_');
        QueueManager.enqueue('CREATE_POST', {
          postData: {...post, clientPostId: tempId},
        });

        const optimisticPost: Post = {
          id: tempId,
          title: post.title,
          content: post.content,
          communityId: post.communityId,
          authorId: 'usr_1',
          authorName: 'Samara Simha Reddy',
          createdAt: new Date().toISOString(),
          isPending: true,
          isFailed: false,
          clientPostId: tempId,
          images: post.images,
        };

        return {
          data: optimisticPost,
          error: {
            code: 'OFFLINE_QUEUED',
            message: 'Network offline. Post enqueued and will sync automatically.',
          },
        };
      }

      const response = await axiosInstance.post<Post>('/posts', {...post, clientPostId: tempId});
      StorageRepository.clearCachePattern('posts_cache_');
      return {data: response.data};
    } catch (error: unknown) {
      StorageRepository.clearCachePattern('posts_cache_');
      const err = error as any;

      if (err.response && err.response.status >= 400 && err.response.status < 500) {
        return {
          error: {
            code: 'CREATE_POST_FAILED',
            message: err.response.data?.message || err.message || 'Failed to create post',
          },
        };
      }

      QueueManager.enqueue('CREATE_POST', {
        postData: {...post, clientPostId: tempId},
      });

      const optimisticPost: Post = {
        id: tempId,
        title: post.title,
        content: post.content,
        communityId: post.communityId,
        authorId: 'usr_1',
        authorName: 'Samara Simha Reddy',
        createdAt: new Date().toISOString(),
        isPending: true,
        isFailed: true,
        clientPostId: tempId,
        images: post.images,
      };

      return {
        data: optimisticPost,
        error: {
          code: 'CREATE_POST_FAILED_QUEUED',
          message: err.message || 'Server request failed. Post enqueued for retry.',
        },
      };
    }
  }

  public async getPostById(id: string): NetworkResult<Post> {
    const cacheKey = `posts_detail_cache_${id}`;
    try {
      const netInfo = await NetInfo.fetch();
      const cached = StorageRepository.get<Post>(cacheKey);

      if (!netInfo.isConnected) {
        if (cached) return {data: cached};
        return {
          error: {
            code: 'OFFLINE_NO_CACHE',
            message: 'You are offline, and this post is not cached.',
          },
        };
      }

      if (cached && !StorageRepository.isStale(cacheKey)) {
        return {data: cached};
      }

      const response = await axiosInstance.get<Post>(`/posts/${id}`);
      StorageRepository.set(cacheKey, response.data, 120);
      return {data: response.data};
    } catch (error: any) {
      const cached = StorageRepository.get<Post>(cacheKey);
      if (cached) return {data: cached};
      return {
        error: {
          code: 'FETCH_POST_DETAIL_FAILED',
          message: error.message || 'Failed to fetch post details',
        },
      };
    }
  }

  public async updatePost(id: string, post: CreatePostRequest): NetworkResult<Post> {
    try {
      const response = await axiosInstance.put<Post>(`/posts/${id}`, post);
      StorageRepository.clearCachePattern('posts_cache_');
      StorageRepository.clearCachePattern(`posts_detail_cache_${id}`);
      return {data: response.data};
    } catch (error: any) {
      return {
        error: {
          code: 'UPDATE_POST_FAILED',
          message: error.response?.data?.message || error.message || 'Failed to update post',
        },
      };
    }
  }

  public async deletePost(id: string): NetworkResult<void> {
    try {
      await axiosInstance.delete(`/posts/${id}`);
      StorageRepository.clearCachePattern('posts_cache_');
      StorageRepository.clearCachePattern(`posts_detail_cache_${id}`);
      return {data: undefined};
    } catch (error: any) {
      return {
        error: {
          code: 'DELETE_POST_FAILED',
          message: error.response?.data?.message || error.message || 'Failed to delete post',
        },
      };
    }
  }
}
