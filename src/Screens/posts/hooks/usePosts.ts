import {useState, useEffect, useCallback} from 'react';
import {useGetPostsQuery} from '../../../APIServices/posts/postsApi';
import NetInfo from '@react-native-community/netinfo';
import {Post} from '../../../Constance/globalTypes';

export const usePosts = (communityId?: string) => {
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const {data, isLoading, isFetching, error, refetch} = useGetPostsQuery({
    communityId,
    page,
    limit: 10,
  });

  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [communityId]);

  useEffect(() => {
    if (data) {
      const newPosts = Array.isArray(data) ? data : [];
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const unique = newPosts.filter(
            np => !prev.some(p => p.id === np.id)
          );
          return [...prev, ...unique];
        });
      }
    }
  }, [data, page]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    try {
      await refetch().unwrap();
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const newPosts = Array.isArray(data) ? data : [];
  const hasMore = newPosts.length === 10;

  const handleLoadMore = useCallback(() => {
    if (!isFetching && !isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, isLoading, hasMore]);

  return {
    posts,
    isLoading: isLoading && page === 1,
    isFetchingMore: isFetching && page > 1,
    isRefreshing,
    isOffline,
    error,
    hasMore,
    handleRefresh,
    handleLoadMore,
  };
};
