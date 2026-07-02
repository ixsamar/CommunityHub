import {baseApi} from '../baseApi';
import {Post, CreatePostRequest} from '../../Constance/globalTypes';
import {PostsRepository} from './postsRepository';

export const postsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPosts: builder.query<Post[], {communityId?: string}>({
      async queryFn(params) {
        const repo = new PostsRepository();
        const result = await repo.getPosts(params);
        if (result.error) {
          return {error: result.error};
        }
        return {data: result.data!};
      },
    }),

    createPost: builder.mutation<Post, CreatePostRequest>({
      async queryFn(postData) {
        const repo = new PostsRepository();
        const result = await repo.createPost(postData);

        if (
          result.error &&
          result.error.code !== 'OFFLINE_QUEUED' &&
          result.error.code !== 'CREATE_POST_FAILED_QUEUED'
        ) {
          return {error: result.error};
        }
        return {data: result.data!};
      },
      async onQueryStarted(postData, {dispatch, queryFulfilled}) {
        const tempId = postData.clientPostId || `opt_${Date.now()}`;
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
          clientPostId: tempId,
          images: postData.images,
        };

        const patchCommunity = dispatch(
          postsApi.util.updateQueryData('getPosts', {communityId: postData.communityId}, draft => {
            if (Array.isArray(draft)) {
              const existingIdx = draft.findIndex(
                p => p.id === tempId || p.clientPostId === tempId,
              );
              if (existingIdx !== -1) {
                draft[existingIdx].isPending = true;
                draft[existingIdx].isFailed = false;
              } else {
                draft.unshift(optimisticPost);
              }
            }
          }),
        );

        const patchAll = dispatch(
          postsApi.util.updateQueryData('getPosts', {}, draft => {
            if (Array.isArray(draft)) {
              const existingIdx = draft.findIndex(
                p => p.id === tempId || p.clientPostId === tempId,
              );
              if (existingIdx !== -1) {
                draft[existingIdx].isPending = true;
                draft[existingIdx].isFailed = false;
              } else {
                draft.unshift(optimisticPost);
              }
            }
          }),
        );

        try {
          const {data: createdPost} = await queryFulfilled;

          dispatch(
            postsApi.util.updateQueryData(
              'getPosts',
              {communityId: postData.communityId},
              draft => {
                if (Array.isArray(draft)) {
                  const idx = draft.findIndex(p => p.id === tempId || p.clientPostId === tempId);
                  if (idx !== -1) draft[idx] = createdPost;
                }
              },
            ),
          );

          dispatch(
            postsApi.util.updateQueryData('getPosts', {}, draft => {
              if (Array.isArray(draft)) {
                const idx = draft.findIndex(p => p.id === tempId || p.clientPostId === tempId);
                if (idx !== -1) draft[idx] = createdPost;
              }
            }),
          );
        } catch (err: unknown) {
          const error = err as {
            message?: string;
            error?: {message?: string};
          };
          const errMsg = error?.message || error?.error?.message || '';

          if (
            errMsg.includes('Offline') ||
            errMsg.includes('queued') ||
            errMsg.includes('Network')
          ) {
            dispatch(
              postsApi.util.updateQueryData(
                'getPosts',
                {communityId: postData.communityId},
                draft => {
                  if (Array.isArray(draft)) {
                    const item = draft.find(p => p.id === tempId || p.clientPostId === tempId);
                    if (item) {
                      item.isPending = true;
                      item.isFailed = errMsg.includes('failed') || errMsg.includes('Server');
                    }
                  }
                },
              ),
            );
            dispatch(
              postsApi.util.updateQueryData('getPosts', {}, draft => {
                if (Array.isArray(draft)) {
                  const item = draft.find(p => p.id === tempId || p.clientPostId === tempId);
                  if (item) {
                    item.isPending = true;
                    item.isFailed = errMsg.includes('failed') || errMsg.includes('Server');
                  }
                }
              }),
            );
          } else {
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
