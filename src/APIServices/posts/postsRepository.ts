import NetInfo from '@react-native-community/netinfo';
import {NetworkResult} from '../repository';
import {Post, CreatePostRequest} from '../../Constance/globalTypes';
import {httpClient} from '../httpClient';
import {StorageRepository} from '../offline/StorageRepository';
import {QueueManager} from '../offline/QueueManager';
import {Logger} from '../../Utils/logger';

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
      const cached = StorageRepository.get<Post[]>(cacheKey);

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
      const cached = StorageRepository.get<Post[]>(cacheKey);
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
    params: {communityId?: string},
    cacheKey: string,
  ): Promise<Post[]> {
    const response = await httpClient.get<Post[]>('/posts', {params});

    StorageRepository.set(cacheKey, response.data, 120);

    try {
      const {store} = await import('../../Store/store');
      const {postsApi} = await import('./postsApi');
      store.dispatch(
        postsApi.util.updateQueryData('getPosts', params, () => {
          return response.data;
        }),
      );
    } catch (err) {
      Logger.error('Failed to dispatch background store update for posts', 'PostsRepository', err);
    }

    return response.data;
  }

  public async createPost(post: CreatePostRequest): NetworkResult<Post> {
    const tempId = post.clientPostId || `opt_${Date.now()}`;
    try {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
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

      const response = await httpClient.post<Post>('/posts', {...post, clientPostId: tempId});
      return {data: response.data};
    } catch (error: unknown) {
      const err = error as Error;

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
}
