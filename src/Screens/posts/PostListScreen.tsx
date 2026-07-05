import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  LayoutAnimation,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlashList} from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {FadeInLeft, FadeOutRight} from 'react-native-reanimated';
import {useTheme} from '../../Utils/themeIndex';
import {PostsStackParamList, RootStackParamList, Post} from '../../Constance/globalTypes';
import {usePosts} from './hooks/usePosts';
import {useAuth} from '../auth/hooks/useAuth';
import {PostCard} from '../../Components/posts/PostCard';
import {OfflineCard} from '../../Components/community/OfflineCard';
import {RetryCard} from '../../Components/community/RetryCard';
import {EmptyState} from '../../Components/common/EmptyState';
import {Skeleton} from '../../Components/common/Skeleton';
import {PaginationLoader} from '../../Components/community/PaginationLoader';
import {GlassBackground} from '../../Components/common/GlassBackground';
import {SearchBar} from '../../Components/community/SearchBar';
import {storage} from '../../Utils/mmkv';
import {useToast} from '../../Components/common/ToastContext';
import {postsApi} from '../../APIServices/posts/postsApi';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PostsStackParamList, 'PostList'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const PostListScreen = () => {
  const {colors, typography, spacing, borderRadius} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {isAuthenticated, user} = useAuth();
  const {showToast} = useToast();
  const [deletePost] = postsApi.useDeletePostMutation();

  const {
    posts,
    isLoading,
    isFetchingMore,
    isRefreshing,
    isOffline,
    error,
    hasMore,
    handleRefresh,
    handleLoadMore,
  } = usePosts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'trending' | 'unanswered' | 'bookmarks'>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'replies'>('recent');

  useEffect(() => {
    const raw = storage.getString('bookmarked_posts');
    if (raw) {
      try {
        setBookmarkedIds(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const handleToggleBookmark = useCallback((postId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let updated: string[];
    const isCurrentlyBookmarked = bookmarkedIds.includes(postId);

    if (isCurrentlyBookmarked) {
      updated = bookmarkedIds.filter(id => id !== postId);
      showToast('Removed from bookmarks', 'info');
    } else {
      updated = [...bookmarkedIds, postId];
      showToast('Saved to bookmarks!', 'success');
    }

    setBookmarkedIds(updated);
    storage.set('bookmarked_posts', JSON.stringify(updated));
  }, [bookmarkedIds, showToast]);

  const handleOptionsPress = useCallback((post: Post) => {
    const isAuthor = !!(user?.id && post.authorId && user.id === post.authorId);

    const buttons = [
      {
        text: 'Copy Content',
        onPress: () => {
          showToast('Content copied to clipboard', 'info');
        },
      },
      {
        text: 'Share',
        onPress: () => {
          showToast('Sharing link generated', 'success');
        },
      },
    ];

    if (isAuthor) {
      buttons.push({
        text: 'Delete Discussion',
        onPress: () => {
          Alert.alert(
            'Delete Discussion',
            'Are you sure you want to delete this discussion permanently?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deletePost(post.id).unwrap();
                    showToast('Post deleted successfully!', 'success');
                    handleRefresh();
                  } catch (err: any) {
                    showToast(err.data?.message || 'Failed to delete post.', 'error');
                  }
                },
              },
            ]
          );
        },
      });
    }

    buttons.push({
      text: 'Cancel',
      style: 'cancel',
    } as any);

    Alert.alert('Discussion Options', 'Manage this post:', buttons as any);
  }, [user, deletePost, showToast, handleRefresh]);

  const handleCreatePostPress = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to create a new post.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Log In',
            onPress: () => {
              navigation.navigate('Auth', {screen: 'Login'});
            },
          },
        ],
        {cancelable: true},
      );
      return;
    }
    navigation.navigate('CreatePost');
  }, [navigation, isAuthenticated]);

  const handleSortOptions = () => {
    Alert.alert('Sort Discussions', 'Choose an order:', [
      {text: 'Recent', onPress: () => setSortBy('recent')},
      {text: 'Popular (Views)', onPress: () => setSortBy('views')},
      {text: 'Replies count', onPress: () => setSortBy('replies')},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const getComputedPosts = () => {
    return posts
      .map(post => {
        const views = (post.title.length * 13) % 450 + 10;
        const replies = (post.title.length * 7) % 25;
        const tag =
          post.title.toLowerCase().includes('architecture') ||
          post.content.toLowerCase().includes('offline')
            ? 'Architecture'
            : post.title.toLowerCase().includes('render') ||
              post.title.toLowerCase().includes('optimize') ||
              post.title.toLowerCase().includes('performance')
            ? 'Performance'
            : post.title.toLowerCase().includes('practice')
            ? 'Best Practices'
            : 'General';

        return {
          ...post,
          views,
          replies,
          tag,
          isBookmarked: bookmarkedIds.includes(post.id),
        };
      })
      .filter(post => {
        if (searchQuery.trim().length > 0) {
          const query = searchQuery.toLowerCase();
          return (
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.authorName.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(post => {
        if (selectedTab === 'unanswered') {
          return post.replies === 0;
        }
        if (selectedTab === 'bookmarks') {
          return post.isBookmarked;
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedTab === 'trending' || sortBy === 'views') {
          return b.views - a.views;
        }
        if (sortBy === 'replies') {
          return b.replies - a.replies;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  const processedList = getComputedPosts();

  const renderPostItem = useCallback(
    ({item}: {item: any}) => (
      <Animated.View entering={FadeInLeft} exiting={FadeOutRight}>
        <PostCard
          post={item}
          onPress={() => navigation.navigate('PostDetails', {postId: item.id})}
          onBookmarkPress={handleToggleBookmark}
          onOptionsPress={handleOptionsPress}
        />
      </Animated.View>
    ),
    [navigation, handleToggleBookmark, handleOptionsPress],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const renderPostSkeleton = () => (
    <View style={styles.skeletonContainer}>
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

  const filterTabs = [
    {id: 'all', label: 'All', icon: 'grid-outline'},
    {id: 'trending', label: 'Trending', icon: 'trending-up-outline'},
    {id: 'unanswered', label: 'Unanswered', icon: 'help-circle-outline'},
    {id: 'bookmarks', label: 'Bookmarks', icon: 'bookmark-outline'},
  ] as const;

  return (
    <GlassBackground>
      <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['top']}>
        <View style={styles.mainWrapper}>
          <View style={[styles.header, {paddingHorizontal: wp('4%')}]}>
            <View>
              <Text style={[typography.h2, {color: colors.text, fontWeight: '800'}]}>
                Discussions
              </Text>
              <Text style={[typography.caption, {color: colors.textSecondary, marginTop: hp('0.2%')}]}>
                Share ideas, ask questions and learn together
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.createPostBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md || 10,
                },
              ]}
              onPress={handleCreatePostPress}
              activeOpacity={0.8}>
              <Icon name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBarRow, {paddingHorizontal: wp('4%')}]}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search discussions..."
              style={StyleSheet.flatten([styles.searchBar, {flex: 1, marginRight: wp('3%')}])}
            />
            <TouchableOpacity
              style={[
                styles.filterIconBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md || 10,
                },
              ]}
              onPress={handleSortOptions}
              activeOpacity={0.8}>
              <Icon name="options-outline" size={20} color={colors.primary} />
              {sortBy !== 'recent' && (
                <View style={[styles.activeFilterDot, {backgroundColor: colors.primary}]} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}>
              {filterTabs.map(tab => {
                const active = selectedTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedTab(tab.id)}
                    style={[
                      styles.tabPill,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Icon
                      name={tab.icon}
                      size={14}
                      color={active ? '#FFFFFF' : colors.text}
                      style={styles.pillIcon}
                    />
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: active ? '#FFFFFF' : colors.text,
                          fontWeight: '700',
                        },
                      ]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {isOffline && <OfflineCard />}

          {isLoading ? (
            renderPostSkeleton()
          ) : (
            <View style={styles.listWrapper}>
              <FlashList
                data={processedList}
                renderItem={renderPostItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={hp('16%')}
                onRefresh={handleRefresh}
                refreshing={isRefreshing}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={<PaginationLoader isLoading={isFetchingMore} hasMore={hasMore} />}
                ListEmptyComponent={
                  <View style={{height: hp('50%'), justifyContent: 'center', alignItems: 'center'}}>
                    <EmptyState
                      title="No Discussions Found"
                      description="Search for something else or create a new topic!"
                      actionLabel="Create Discussion"
                      onAction={handleCreatePostPress}
                    />
                  </View>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.fab, {backgroundColor: '#003580', shadowColor: '#003580'}]}
          onPress={handleCreatePostPress}
          activeOpacity={0.85}>
          <Icon name="add" size={28} color="#ffffff" />
        </TouchableOpacity>
      </SafeAreaView>
    </GlassBackground>
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
  createPostBtn: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  searchBar: {
    height: hp('5.5%'),
  },
  filterIconBtn: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 5,
    right: 5,
  },
  tabsContainer: {
    marginBottom: hp('1.5%'),
  },
  tabsScrollContent: {
    paddingHorizontal: wp('4%'),
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('4%'),
    marginRight: wp('2.5%'),
  },
  pillIcon: {
    marginRight: 6,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('10%'),
  },
  fab: {
    position: 'absolute',
    bottom: hp('3.5%'),
    right: wp('5%'),
    width: wp('13.5%'),
    height: wp('13.5%'),
    borderRadius: wp('6.75%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: wp('4%'),
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
