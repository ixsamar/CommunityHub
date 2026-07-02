import {useState, useEffect, useCallback} from 'react';
import {useAppDispatch} from '../../../Utils/hooks/useAppDispatch';
import {useAppSelector} from '../../../Utils/hooks/useAppSelector';
import {
  setSearchQuery,
  setSortBy,
  setFilterType,
  setScrollOffset,
  setListPage,
} from '../../../Store/slices/communitySlice';
import {useGetCommunitiesQuery} from '../../../APIServices/community/communityApi';
import NetInfo from '@react-native-community/netinfo';

export const useCommunities = () => {
  const dispatch = useAppDispatch();

  const searchQuery = useAppSelector(state => state.community.searchQuery);
  const sortBy = useAppSelector(state => state.community.sortBy);
  const filterType = useAppSelector(state => state.community.filterType);
  const scrollOffset = useAppSelector(state => state.community.scrollOffset);
  const listPage = useAppSelector(state => state.community.listPage);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, dispatch]);

  const {data, isLoading, isFetching, error, refetch} = useGetCommunitiesQuery({
    search: searchQuery,
    sort: sortBy,
    filter: filterType,
    page: listPage,
    limit: 10,
  });

  const communities = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const hasMore = listPage < totalPages;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(setListPage(1));
    try {
      await refetch().unwrap();
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && !isLoading && hasMore) {
      dispatch(setListPage(listPage + 1));
    }
  }, [isFetching, isLoading, hasMore, listPage, dispatch]);

  const handleSaveScrollOffset = useCallback(
    (offset: number) => {
      dispatch(setScrollOffset(offset));
    },
    [dispatch],
  );

  const handleSortChange = useCallback(
    (newSort: 'name' | 'members' | 'recent') => {
      dispatch(setSortBy(newSort));
    },
    [dispatch],
  );

  const handleFilterChange = useCallback(
    (newFilter: 'all' | 'public' | 'private') => {
      dispatch(setFilterType(newFilter));
    },
    [dispatch],
  );

  return {
    communities,
    localSearch,
    setLocalSearch,
    sortBy,
    filterType,
    scrollOffset,
    listPage,
    isLoading: isLoading && listPage === 1,
    isFetchingMore: isFetching && listPage > 1,
    isRefreshing,
    isOffline,
    error,
    hasMore,
    handleRefresh,
    handleLoadMore,
    handleSaveScrollOffset,
    handleSortChange,
    handleFilterChange,
    refetch,
  };
};
