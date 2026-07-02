import {useState, useEffect, useCallback} from 'react';
import {useGetPostsQuery} from '../../../APIServices/posts/postsApi';
import NetInfo from '@react-native-community/netinfo';

export const usePosts = (communityId?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const {data: posts = [], isLoading, isFetching, error, refetch} = useGetPostsQuery({communityId});

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch().unwrap();
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return {
    posts,
    isLoading: isLoading && posts.length === 0,
    isFetching,
    isRefreshing,
    isOffline,
    error,
    handleRefresh,
  };
};
