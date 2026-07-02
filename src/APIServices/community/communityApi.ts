import {baseApi} from '../baseApi';
import {
  Community,
  CommunityQueryParams,
  PaginatedResponse,
  CreateCommunityRequest,
} from '../../Constance/globalTypes';
import {CommunityRepository} from './communityRepository';
import {RootState} from '../../Store/store';

export const communityApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCommunities: builder.query<PaginatedResponse<Community>, CommunityQueryParams>({
      async queryFn(args) {
        const repository = new CommunityRepository();
        const result = await repository.getCommunities(args);
        if (result.error) {
          return {error: result.error};
        }
        return {data: result.data!};
      },

      serializeQueryArgs: ({endpointName, queryArgs}) => {
        const {search = '', sort = 'name', filter = 'all'} = queryArgs;
        return `${endpointName}-${search}-${sort}-${filter}`;
      },

      merge: (currentCache, newItems, {arg}) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          data: [...(currentCache?.data || []), ...newItems.data],
        };
      },

      forceRefetch({currentArg, previousArg}) {
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
          return {error: result.error};
        }
        return {data: result.data!};
      },
    }),

    joinCommunity: builder.mutation<Community, string>({
      async queryFn(id) {
        const repository = new CommunityRepository();
        const result = await repository.joinCommunity(id);
        if (result.error && result.error.code !== 'OFFLINE_QUEUED') {
          return {error: result.error};
        }
        return {data: result.data!};
      },
      async onQueryStarted(id, {dispatch, queryFulfilled, getState}) {
        const state = getState() as RootState;
        const search = state.community?.searchQuery || '';
        const sort = state.community?.sortBy || 'name';
        const filter = state.community?.filterType || 'all';

        const patchList = dispatch(
          communityApi.util.updateQueryData(
            'getCommunities',
            {search, sort, filter, page: 1, limit: 10},
            draft => {
              if (!draft?.data) return;
              const item = draft.data.find(c => c.id === id);
              if (item && !item.isJoined) {
                item.isJoined = true;
                item.members += 1;
              }
            },
          ),
        );

        const patchDetail = dispatch(
          communityApi.util.updateQueryData('getCommunityById', id, draft => {
            if (draft && !draft.isJoined) {
              draft.isJoined = true;
              draft.members += 1;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchDetail.undo();
        }
      },
    }),

    leaveCommunity: builder.mutation<Community, string>({
      async queryFn(id) {
        const repository = new CommunityRepository();
        const result = await repository.leaveCommunity(id);
        if (result.error && result.error.code !== 'OFFLINE_QUEUED') {
          return {error: result.error};
        }
        return {data: result.data!};
      },
      async onQueryStarted(id, {dispatch, queryFulfilled, getState}) {
        const state = getState() as RootState;
        const search = state.community?.searchQuery || '';
        const sort = state.community?.sortBy || 'name';
        const filter = state.community?.filterType || 'all';

        const patchList = dispatch(
          communityApi.util.updateQueryData(
            'getCommunities',
            {search, sort, filter, page: 1, limit: 10},
            draft => {
              if (!draft?.data) return;
              const item = draft.data.find(c => c.id === id);
              if (item && item.isJoined) {
                item.isJoined = false;
                item.members = Math.max(0, item.members - 1);
              }
            },
          ),
        );

        const patchDetail = dispatch(
          communityApi.util.updateQueryData('getCommunityById', id, draft => {
            if (draft && draft.isJoined) {
              draft.isJoined = false;
              draft.members = Math.max(0, draft.members - 1);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchList.undo();
          patchDetail.undo();
        }
      },
    }),

    createCommunity: builder.mutation<Community, CreateCommunityRequest>({
      async queryFn(communityData) {
        const repository = new CommunityRepository();
        const result = await repository.createCommunity(communityData);
        if (result.error && result.error.code !== 'OFFLINE_QUEUED') {
          return {error: result.error};
        }
        return {data: result.data!};
      },
      async onQueryStarted(communityData, {dispatch, queryFulfilled, getState}) {
        const tempId = `community_${Date.now()}`;
        const optimisticCommunity: Community = {
          id: tempId,
          name: communityData.name,
          description: communityData.description,
          members: 1,
          isPrivate: communityData.isPrivate,
          createdAt: new Date().toISOString(),
          isJoined: true,
        };

        const state = getState() as RootState;
        const search = state.community?.searchQuery || '';
        const sort = state.community?.sortBy || 'name';
        const filter = state.community?.filterType || 'all';

        const patchList = dispatch(
          communityApi.util.updateQueryData(
            'getCommunities',
            {search, sort, filter, page: 1, limit: 10},
            draft => {
              if (draft?.data) {
                draft.data.unshift(optimisticCommunity);
              }
            },
          ),
        );

        try {
          const {data: createdCommunity} = await queryFulfilled;
          dispatch(
            communityApi.util.updateQueryData(
              'getCommunities',
              {search, sort, filter, page: 1, limit: 10},
              draft => {
                if (draft?.data) {
                  const idx = draft.data.findIndex(c => c.id === tempId);
                  if (idx !== -1) draft.data[idx] = createdCommunity;
                }
              },
            ),
          );
        } catch {
          patchList.undo();
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
  useCreateCommunityMutation,
} = communityApi;
