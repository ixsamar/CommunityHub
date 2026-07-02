import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlashList} from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/Ionicons';

import {useTheme} from '../../Utils/themeIndex';
import {PostsStackParamList} from '../../Constance/globalTypes';
import {usePosts} from './hooks/usePosts';
import {PostCard} from '../../Components/posts/PostCard';
import {OfflineCard} from '../../Components/community/OfflineCard';
import {RetryCard} from '../../Components/community/RetryCard';
import {EmptyState} from '../../Components/common/EmptyState';
import {Skeleton} from '../../Components/common/Skeleton';
import {Post} from '../../Constance/globalTypes';
import {PerformanceMonitor} from '../../Utils/performance';

type NavigationProp = NativeStackNavigationProp<PostsStackParamList, 'PostList'>;

export const PostListScreen = () => {
  const {colors, typography, spacing} = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const {posts, isLoading, isRefreshing, isOffline, error, handleRefresh} = usePosts();

  useEffect(() => {
    const trace = PerformanceMonitor.startTrace('PostListScreenMount');
    return () => trace();
  }, []);

  useEffect(() => {
    if (isLoading) {
      const trace = PerformanceMonitor.startTrace('PostListScreenLoad');
      return () => trace();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isRefreshing) {
      const trace = PerformanceMonitor.startTrace('PostListScreenRefresh');
      return () => trace();
    }
  }, [isRefreshing]);

  const handleCreatePostPress = useCallback(() => {
    navigation.navigate('CreatePost');
  }, [navigation]);

  const renderPostItem = useCallback(({item}: {item: Post}) => <PostCard post={item} />, []);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const renderPostSkeleton = () => (
    <View style={[styles.skeletonContainer, {backgroundColor: colors.background}]}>
      {Array.from({length: 4}).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.skeletonCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              padding: spacing.md || wp('4%'),
            },
          ]}>
          <View style={styles.skeletonHeader}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <View style={styles.skeletonMeta}>
              <Skeleton width="40%" height={14} borderRadius={3} style={styles.mb} />
              <Skeleton width="25%" height={10} borderRadius={3} />
            </View>
          </View>
          <Skeleton
            width="70%"
            height={18}
            borderRadius={4}
            style={{marginBottom: hp('0.8%'), marginTop: hp('1.5%')}}
          />
          <Skeleton width="95%" height={14} borderRadius={3} style={styles.mb} />
          <Skeleton width="85%" height={14} borderRadius={3} />
        </View>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: colors.background, paddingHorizontal: wp('4%')},
        ]}
        edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={[typography.h2, {color: colors.text}]}>Recent Discussions</Text>
        </View>
        {renderPostSkeleton()}
      </SafeAreaView>
    );
  }

  if (error && posts.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top', 'left', 'right']}>
        <RetryCard onRetry={handleRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top', 'left', 'right']}>
      <View style={[styles.mainWrapper, {paddingHorizontal: wp('4%')}]}>
        {}
        <View style={styles.header}>
          <Text style={[typography.h2, {color: colors.text}]}>Discussions</Text>
          {isOffline && (
            <View style={styles.offlineIconBadge}>
              <Icon name="cloud-offline" size={16} color={colors.warning} />
            </View>
          )}
        </View>

        {}
        {isOffline && <OfflineCard />}

        {}
        <View style={styles.listWrapper}>
          <FlashList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={hp('14%')}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            ListEmptyComponent={
              <EmptyState
                title="No Posts Available"
                description="Be the first to share your thoughts by posting a new topic in a community."
                actionLabel="Create First Post"
                onAction={handleCreatePostPress}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: colors.primary, shadowColor: colors.primary}]}
        onPress={handleCreatePostPress}
        activeOpacity={0.85}>
        <Icon name="add" size={26} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mainWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1.5%'),
    marginBottom: hp('1.5%'),
  },
  offlineIconBadge: {
    padding: 6,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: hp('10%'),
  },
  fab: {
    position: 'absolute',
    bottom: hp('4%'),
    right: wp('5%'),
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: hp('0.8%'),
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonMeta: {
    marginLeft: wp('2.5%'),
    flex: 1,
  },
  mb: {
    marginBottom: hp('0.8%'),
  },
});
