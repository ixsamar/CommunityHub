import {baseApi} from '../../../common/api/baseApi';
import {Post, CreatePostRequest} from '../types';
import {PostsRepository} from '../services/postsRepository';

export const postsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPosts: builder.query<Post[], {communityId?: string}>({
      async queryFn(params) {
        const repo = new PostsRepository();
        const result = await repo.getPosts(params);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data! };
      },
    }),

    createPost: builder.mutation<Post, CreatePostRequest>({
      async queryFn(postData) {
        const repo = new PostsRepository();
        const result = await repo.createPost(postData);
        // Note: OFFLINE_QUEUED and CREATE_POST_FAILED_QUEUED return data (optimistic post) alongside error.
        // We want to resolve successfully in RTK query state so the client receives the optimistic post.
        if (result.error && result.error.code !== 'OFFLINE_QUEUED' && result.error.code !== 'CREATE_POST_FAILED_QUEUED') {
          return { error: result.error };
        }
        return { data: result.data! };
      },
      async onQueryStarted(postData, { dispatch, queryFulfilled }) {
        const tempId = `opt_${Date.now()}`;
        const optimisticPost: Post = {
          id: tempId,
          title: postData.title,
          content: postData.content,
          communityId: postData.communityId,
          authorId: 'usr_1',
          authorName: 'Samara Simha Reddy',
          createdAt: new Date().toISOString(),
          isPending: true,
          isFailed: false,
        };

        // 1. Optimistic patch for community-specific feed
        const patchCommunity = dispatch(
          postsApi.util.updateQueryData('getPosts', {communityId: postData.communityId}, (draft) => {
            if (Array.isArray(draft)) {
              draft.unshift(optimisticPost);
            }
          })
        );

        // 2. Optimistic patch for general feed
        const patchAll = dispatch(
          postsApi.util.updateQueryData('getPosts', {}, (draft) => {
            if (Array.isArray(draft)) {
              draft.unshift(optimisticPost);
            }
          })
        );

        try {
          const {data: createdPost} = await queryFulfilled;

          // Swap temp optimistic post with actual created post
          dispatch(
            postsApi.util.updateQueryData('getPosts', {communityId: postData.communityId}, (draft) => {
              if (Array.isArray(draft)) {
                const idx = draft.findIndex(p => p.id === tempId);
                if (idx !== -1) draft[idx] = createdPost;
              }
            })
          );

          dispatch(
            postsApi.util.updateQueryData('getPosts', {}, (draft) => {
              if (Array.isArray(draft)) {
                const idx = draft.findIndex(p => p.id === tempId);
                if (idx !== -1) draft[idx] = createdPost;
              }
            })
          );
        } catch (err: unknown) {
          const error = err as {
            message?: string;
            error?: { message?: string };
          };
          const errMsg = error?.message || error?.error?.message || '';
          
          // If offline enqueued, keep optimistic post but mark it accordingly
          if (errMsg.includes('Offline') || errMsg.includes('queued') || errMsg.includes('Network')) {
            dispatch(
              postsApi.util.updateQueryData('getPosts', {communityId: postData.communityId}, (draft) => {
                if (Array.isArray(draft)) {
                  const item = draft.find(p => p.id === tempId);
                  if (item) {
                    item.isPending = true;
                    item.isFailed = errMsg.includes('failed') || errMsg.includes('Server');
                  }
                }
              })
            );
            dispatch(
              postsApi.util.updateQueryData('getPosts', {}, (draft) => {
                if (Array.isArray(draft)) {
                  const item = draft.find(p => p.id === tempId);
                  if (item) {
                    item.isPending = true;
                    item.isFailed = errMsg.includes('failed') || errMsg.includes('Server');
                  }
                }
              })
            );
          } else {
            // Permanent fail, undo optimistic updates
            patchCommunity.undo();
            patchAll.undo();
          }
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {useGetPostsQuery, useCreatePostMutation} = postsApi;
