import NetInfo from '@react-native-community/netinfo';
import {NetworkResult} from '../../../common/api/repository';
import {Post, CreatePostRequest} from '../types';
import {httpClient} from '../../../common/api/httpClient';
import {StorageRepository} from '../../../common/services/offline/StorageRepository';
import {QueueManager} from '../../../common/services/offline/QueueManager';
import {Logger} from '../../../common/utils/logger';

export interface IPostsRepository {
  getPosts(params: {communityId?: string}): NetworkResult<Post[]>;
  createPost(post: CreatePostRequest): NetworkResult<Post>;
}

export class PostsRepository implements IPostsRepository {
  private getCacheKey(communityId?: string): string {
    return `posts_cache_${communityId || 'all'}`;
  }

  public async getPosts(params: {communityId?: string}): NetworkResult<Post[]> {
    const cacheKey = this.getCacheKey(params.communityId);
    try {
      const netInfo = await NetInfo.fetch();

      // Offline read from cache (SWR fallback)
      if (!netInfo.isConnected) {
        const cached = StorageRepository.get<Post[]>(cacheKey);
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

      // Online: Fetch from Mock server
      const response = await httpClient.get<Post[]>('/posts', {params});

      // Write cache (TTL = 5 minutes / 300s)
      StorageRepository.set(cacheKey, response.data, 300);

      return {data: response.data};
    } catch (error: unknown) {
      // If server fetch failed (e.g. timeout), fallback to stale cache
      const cached = StorageRepository.get<Post[]>(cacheKey);
      if (cached) {
        Logger.warn(`Online fetch failed, falling back to stale cache: ${cacheKey}`, 'PostsRepository');
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

  public async createPost(post: CreatePostRequest): NetworkResult<Post> {
    try {
      const netInfo = await NetInfo.fetch();

      // Offline: Add to Sync Queue and return optimistic template
      if (!netInfo.isConnected) {
        const tempId = `opt_${Date.now()}`;
        QueueManager.enqueue('CREATE_POST', {
          postData: post,
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
        };

        return {
          data: optimisticPost,
          error: {
            code: 'OFFLINE_QUEUED',
            message: 'Network offline. Post enqueued and will sync automatically.',
          },
        };
      }

      // Online: Make actual request
      const response = await httpClient.post<Post>('/posts', post);
      return {data: response.data};
    } catch (error: unknown) {
      const err = error as Error;
      
      // If request timed out or failed due to transient issues, queue it
      const tempId = `opt_${Date.now()}`;
      QueueManager.enqueue('CREATE_POST', {
        postData: post,
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
        isFailed: true, // Marked as failed since the actual request failed
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
}
