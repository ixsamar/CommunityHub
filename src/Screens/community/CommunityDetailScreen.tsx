import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import {LazyImage} from '../../Components/common/LazyImage';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '../../Utils/themeIndex';
import {PostCard} from '../../Components/posts/PostCard';
import {CommunityStackParamList} from '../../Constance/globalTypes';
import {useCommunityDetail} from './hooks/useCommunityDetail';
import {RetryCard} from '../../Components/community/RetryCard';
import {OfflineCard} from '../../Components/community/OfflineCard';
import {useAuth} from '../auth/hooks/useAuth';
import {useAppDispatch} from '../../Utils/hooks/useAppDispatch';
import {clearCredentials} from '../../Store/slices/authSlice';

type ScreenRouteProp = RouteProp<CommunityStackParamList, 'CommunityDetails'>;

export const CommunityDetailScreen = () => {
  const {colors, typography} = useTheme();
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation();
  const {communityId} = route.params;
  const {isAuthenticated} = useAuth();
  const dispatch = useAppDispatch();

  const {
    community,
    posts,
    isLoading,
    isLoadingPosts,
    isActionLoading,
    isRefreshing,
    isOffline,
    errorDetail,
    errorPosts,
    handleRefresh,
    handleJoin,
    handleLeave,
    refetchPosts,
  } = useCommunityDetail(communityId);

  const formatJoinedDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleActionButtonPress = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to join or leave communities.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Log In',
            onPress: () => {
              (navigation as any).navigate('Auth');
            },
          },
        ],
        {cancelable: true},
      );
      return;
    }
    if (community?.isJoined) {
      handleLeave();
    } else {
      handleJoin();
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.bodyMedium, {color: colors.textSecondary, marginTop: hp('2%')}]}>
            Loading community details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorDetail || !community) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background}]}
        edges={['top']}>
        <View style={styles.backHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <RetryCard
          message={
            (errorDetail as {data?: {message?: string}})?.data?.message ||
            'Could not load community details. Verify your connection and try again.'
          }
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {}
      <SafeAreaView style={styles.headerFloatingContainer} edges={['top']}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.floatingBackBtn, {backgroundColor: 'rgba(0,0,0,0.5)'}]}
          activeOpacity={0.8}>
          <Icon name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {}
        <View style={styles.bannerContainer}>
          {community.image ? (
            <LazyImage
              source={{uri: community.image}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerPlaceholder, {backgroundColor: colors.surfaceVariant}]}>
              <Icon name="people" size={64} color={colors.textSecondary} />
            </View>
          )}
          {}
          <View style={styles.bannerOverlay} />
        </View>

        {}
        <View
          style={[
            styles.profileCard,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          {}
          {isOffline && <OfflineCard />}

          <View style={styles.profileHeader}>
            <View style={styles.titleWrapper}>
              <Text style={[typography.h2, {color: colors.text}]} numberOfLines={2}>
                {community.name}
              </Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, {backgroundColor: colors.surfaceVariant}]}>
                  <Icon
                    name={community.isPrivate ? 'lock-closed' : 'earth'}
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text style={[typography.caption, {color: colors.textSecondary, marginLeft: 4}]}>
                    {community.isPrivate ? 'Private' : 'Public'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {backgroundColor: colors.surfaceVariant, marginLeft: wp('2%')},
                  ]}>
                  <Icon name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={[typography.caption, {color: colors.textSecondary, marginLeft: 4}]}>
                    Created {formatJoinedDate(community.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {}
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: community.isJoined ? colors.surfaceVariant : colors.primary,
                borderColor: community.isJoined ? colors.border : 'transparent',
                borderWidth: community.isJoined ? 1 : 0,
              },
            ]}
            onPress={handleActionButtonPress}
            disabled={isActionLoading}
            activeOpacity={0.8}>
            {isActionLoading ? (
              <ActivityIndicator
                size="small"
                color={community.isJoined ? colors.text : '#ffffff'}
              />
            ) : (
              <View style={styles.actionBtnRow}>
                <Icon
                  name={community.isJoined ? 'exit-outline' : 'person-add-outline'}
                  size={16}
                  color={community.isJoined ? colors.text : '#ffffff'}
                />
                <Text
                  style={[
                    typography.bodyMedium,
                    {
                      color: community.isJoined ? colors.text : '#ffffff',
                      fontWeight: '700',
                      marginLeft: wp('2%'),
                    },
                  ]}>
                  {community.isJoined ? 'Leave Community' : 'Join Community'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {}
          <View style={[styles.statsGrid, {borderColor: colors.border}]}>
            <View style={styles.statBox}>
              <Text style={[typography.h2, {color: colors.primary, fontWeight: '800'}]}>
                {community.members.toLocaleString()}
              </Text>
              <Text style={[typography.caption, {color: colors.textSecondary, marginTop: 2}]}>
                MEMBERS
              </Text>
            </View>
            <View style={[styles.verticalDivider, {backgroundColor: colors.border}]} />
            <View style={styles.statBox}>
              <Text style={[typography.h2, {color: colors.secondary, fontWeight: '800'}]}>
                {community.postsCount || posts.length}
              </Text>
              <Text style={[typography.caption, {color: colors.textSecondary, marginTop: 2}]}>
                POSTS
              </Text>
            </View>
          </View>

          {}
          <View style={styles.descriptionSection}>
            <Text
              style={[
                typography.bodyMedium,
                {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('1%')},
              ]}>
              ABOUT THE COMMUNITY
            </Text>
            <Text style={[typography.bodyMedium, {color: colors.text, lineHeight: 22}]}>
              {community.description}
            </Text>
          </View>
        </View>

        {}
        <View style={styles.membersSection}>
          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.textSecondary,
                fontWeight: '700',
                marginHorizontal: wp('6%'),
                marginBottom: hp('1.5%'),
              },
            ]}>
            COMMUNITY MEMBERS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.membersScroll, {paddingHorizontal: wp('6%')}]}>
            {Array.from({length: 6}).map((_, i) => (
              <View key={i} style={styles.memberAvatarWrapper}>
                <View
                  style={[
                    styles.memberAvatar,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Icon name="person" size={16} color={colors.textSecondary} />
                </View>
                <Text
                  style={[typography.caption, {color: colors.text, marginTop: 4, fontSize: 10}]}>
                  User {i + 1}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {}
        <View style={styles.postsSection}>
          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.textSecondary,
                fontWeight: '700',
                marginHorizontal: wp('6%'),
                marginBottom: hp('1.5%'),
              },
            ]}>
            LATEST DISCUSSION
          </Text>

          {isLoadingPosts ? (
            <View style={styles.loadingPostsBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={[typography.caption, {color: colors.textSecondary, marginTop: hp('1%')}]}>
                Loading posts...
              </Text>
            </View>
          ) : errorPosts ? (
            <View
              style={[
                styles.postsErrorCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.error,
                },
              ]}>
              <Icon name="warning-outline" size={24} color={colors.error} />
              <Text
                style={[
                  typography.bodySmall,
                  {color: colors.text, marginTop: hp('1%'), textAlign: 'center'},
                ]}>
                Unable to load community discussions.
              </Text>
              <TouchableOpacity
                onPress={refetchPosts}
                style={[styles.retryPostsBtn, {backgroundColor: colors.primary}]}
                activeOpacity={0.8}>
                <Text style={[typography.caption, {color: '#ffffff', fontWeight: '700'}]}>
                  Retry Posts
                </Text>
              </TouchableOpacity>
            </View>
          ) : posts.length === 0 ? (
            <View
              style={[
                styles.postsEmptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <Icon name="chatbox-ellipses-outline" size={28} color={colors.textSecondary} />
              <Text
                style={[
                  typography.bodySmall,
                  {color: colors.textSecondary, marginTop: hp('1%'), textAlign: 'center'},
                ]}>
                No discussions yet. Be the first to start a conversation!
              </Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              scrollEnabled={false}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <PostCard
                  post={item}
                  onPress={() => (navigation as any).navigate('PostDetails', {postId: item.id})}
                />
              )}
              contentContainerStyle={styles.postsList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('6%'),
  },
  backHeader: {
    height: hp('6%'),
    justifyContent: 'center',
    paddingHorizontal: wp('4%'),
  },
  backBtn: {
    padding: 6,
  },
  headerFloatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: wp('4%'),
  },
  floatingBackBtn: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
  },
  scrollContent: {
    paddingBottom: hp('5%'),
  },
  bannerContainer: {
    height: hp('24%'),
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  profileCard: {
    marginTop: -hp('3%'),
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('3%'),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.8%'),
    marginTop: hp('2.5%'),
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: hp('2%'),
    marginTop: hp('3%'),
    marginBottom: hp('3%'),
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: hp('3.5%'),
  },
  descriptionSection: {
    marginBottom: hp('1%'),
  },
  membersSection: {
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
  membersScroll: {
    paddingVertical: hp('0.5%'),
  },
  memberAvatarWrapper: {
    alignItems: 'center',
    marginRight: wp('4%'),
  },
  memberAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postsSection: {
    marginTop: hp('2%'),
  },
  loadingPostsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('4%'),
  },
  postsErrorCard: {
    marginHorizontal: wp('6%'),
    borderRadius: 12,
    borderWidth: 1,
    padding: wp('5%'),
    alignItems: 'center',
  },
  retryPostsBtn: {
    marginTop: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 8,
  },
  postsEmptyCard: {
    marginHorizontal: wp('6%'),
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
  },
  postsList: {
    paddingHorizontal: wp('6%'),
  },
  postCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorDetails: {
    marginLeft: wp('2.5%'),
  },
});
