import {useState, useEffect, useCallback} from 'react';
import {useAppDispatch} from '../../../common/hooks/useAppDispatch';
import {useAppSelector} from '../../../common/hooks/useAppSelector';
import {
  setSearchQuery,
  setSortBy,
  setFilterType,
  setScrollOffset,
  setListPage,
} from '../store/communitySlice';
import {useGetCommunitiesQuery} from '../api/communityApi';
import NetInfo from '@react-native-community/netinfo';

export const useCommunities = () => {
  const dispatch = useAppDispatch();

  // State from Redux
  const searchQuery = useAppSelector(state => state.community.searchQuery);
  const sortBy = useAppSelector(state => state.community.sortBy);
  const filterType = useAppSelector(state => state.community.filterType);
  const scrollOffset = useAppSelector(state => state.community.scrollOffset);
  const listPage = useAppSelector(state => state.community.listPage);

  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Check offline status on mount/change
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Sync local search state if Redux state changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, dispatch]);

  // Fetch paginated communities
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCommunitiesQuery({
    search: searchQuery,
    sort: sortBy,
    filter: filterType,
    page: listPage,
    limit: 10,
  });

  const communities = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const hasMore = listPage < totalPages;

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    dispatch(setListPage(1));
    try {
      await refetch().unwrap();
    } catch {
      // Handled globally
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, dispatch]);

  // Handle pagination infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!isFetching && !isLoading && hasMore) {
      dispatch(setListPage(listPage + 1));
    }
  }, [isFetching, isLoading, hasMore, listPage, dispatch]);

  // Save scroll position for preservation
  const handleSaveScrollOffset = useCallback(
    (offset: number) => {
      dispatch(setScrollOffset(offset));
    },
    [dispatch],
  );

  // Setters for filters/sorts
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
    isLoading: isLoading && listPage === 1, // Only show main loading on page 1
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
