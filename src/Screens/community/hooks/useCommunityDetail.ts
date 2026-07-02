import {useState, useCallback, useEffect} from 'react';
import {
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from '../../../APIServices/community/communityApi';
import {useGetPostsQuery} from '../../../APIServices/posts/postsApi';
import {useToast} from '../../../Components/common/ToastContext';
import NetInfo from '@react-native-community/netinfo';

export const useCommunityDetail = (communityId: string) => {
  const {showToast} = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const {
    data: community,
    isLoading: isLoadingDetail,
    error: errorDetail,
    refetch: refetchDetail,
  } = useGetCommunityByIdQuery(communityId);

  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    error: errorPosts,
    refetch: refetchPosts,
  } = useGetPostsQuery({communityId});

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDetail(), refetchPosts()]);
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchDetail, refetchPosts]);

  const [joinTrigger, {isLoading: isJoining}] = useJoinCommunityMutation();
  const [leaveTrigger, {isLoading: isLeaving}] = useLeaveCommunityMutation();

  const handleJoin = useCallback(async () => {
    try {
      await joinTrigger(communityId).unwrap();
      showToast('Welcome! You have joined the community.', 'success');
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        error?: {message?: string};
        data?: {message?: string};
      };
      const errMsg = error?.message || error?.error?.message || '';
      if (errMsg.includes('Offline') || errMsg.includes('queued')) {
        showToast('You are offline. Join request queued for sync.', 'success');
      } else {
        showToast(error?.data?.message || 'Could not join community. Please try again.', 'error');
      }
    }
  }, [communityId, joinTrigger, showToast]);

  const handleLeave = useCallback(async () => {
    try {
      await leaveTrigger(communityId).unwrap();
      showToast('You have left the community.', 'success');
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        error?: {message?: string};
        data?: {message?: string};
      };
      const errMsg = error?.message || error?.error?.message || '';
      if (errMsg.includes('Offline') || errMsg.includes('queued')) {
        showToast('You are offline. Leave request queued for sync.', 'success');
      } else {
        showToast(error?.data?.message || 'Could not leave community. Please try again.', 'error');
      }
    }
  }, [communityId, leaveTrigger, showToast]);

  return {
    community,
    posts,
    isLoading: isLoadingDetail,
    isLoadingPosts,
    isActionLoading: isJoining || isLeaving,
    isRefreshing,
    isOffline,
    errorDetail,
    errorPosts,
    handleRefresh,
    handleJoin,
    handleLeave,
    refetchPosts,
  };
};
