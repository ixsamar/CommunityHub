import {baseApi} from '../../../common/api/baseApi';
import {Community, CommunityQueryParams, PaginatedResponse} from '../types';
import {CommunityRepository} from '../services/communityRepository';
import {RootState} from '../../../app/store';

export const communityApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCommunities: builder.query<PaginatedResponse<Community>, CommunityQueryParams>({
      async queryFn(args) {
        const repository = new CommunityRepository();
        const result = await repository.getCommunities(args);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data! };
      },
      // Serialize key ignoring page index so we can merge pages in a single cache entry
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { search = '', sort = 'name', filter = 'all' } = queryArgs;
        return `${endpointName}-${search}-${sort}-${filter}`;
      },
      // Merges the paginated results into the cached array
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...(currentCache?.data || []), ...newItems.data],
        };
      },
      // Decide if we should refetch
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.search !== previousArg?.search ||
          currentArg?.sort !== previousArg?.sort ||
          currentArg?.filter !== previousArg?.filter ||
          currentArg?.page !== previousArg?.page
        );
      },
    }),

    getCommunityById: builder.query<Community, string>({
      async queryFn(id) {
        const repository = new CommunityRepository();
        const result = await repository.getCommunityById(id);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data! };
      },
    }),

    joinCommunity: builder.mutation<Community, string>({
      async queryFn(id) {
        const repository = new CommunityRepository();
        const result = await repository.joinCommunity(id);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data! };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const search = state.community?.searchQuery || '';
        const sort = state.community?.sortBy || 'name';
        const filter = state.community?.filterType || 'all';

        // 1. Optimistic update in list query
        const patchList = dispatch(
          communityApi.util.updateQueryData(
            'getCommunities',
            { search, sort, filter, page: 1, limit: 10 },
            (draft) => {
              if (!draft?.data) return;
              const item = draft.data.find(c => c.id === id);
              if (item && !item.isJoined) {
                item.isJoined = true;
                item.members += 1;
              }
            }
          )
        );

        // 2. Optimistic update in detail query
        const patchDetail = dispatch(
          communityApi.util.updateQueryData('getCommunityById', id, (draft) => {
            if (draft && !draft.isJoined) {
              draft.isJoined = true;
              draft.members += 1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Rollback on failure
          patchList.undo();
          patchDetail.undo();
        }
      },
    }),

    leaveCommunity: builder.mutation<Community, string>({
      async queryFn(id) {
        const repository = new CommunityRepository();
        const result = await repository.leaveCommunity(id);
        if (result.error) {
          return { error: result.error };
        }
        return { data: result.data! };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as RootState;
        const search = state.community?.searchQuery || '';
        const sort = state.community?.sortBy || 'name';
        const filter = state.community?.filterType || 'all';

        // 1. Optimistic update in list query
        const patchList = dispatch(
          communityApi.util.updateQueryData(
            'getCommunities',
            { search, sort, filter, page: 1, limit: 10 },
            (draft) => {
              if (!draft?.data) return;
              const item = draft.data.find(c => c.id === id);
              if (item && item.isJoined) {
                item.isJoined = false;
                item.members = Math.max(0, item.members - 1);
              }
            }
          )
        );

        // 2. Optimistic update in detail query
        const patchDetail = dispatch(
          communityApi.util.updateQueryData('getCommunityById', id, (draft) => {
            if (draft && draft.isJoined) {
              draft.isJoined = false;
              draft.members = Math.max(0, draft.members - 1);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Rollback on failure
          patchList.undo();
          patchDetail.undo();
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} = communityApi;
