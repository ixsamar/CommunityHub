import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';
import {useTheme} from '../../Utils/themeIndex';
import {Post} from '../../Constance/globalTypes';
import {usePressAnimation} from '../../Utils/animations';
import {useAppDispatch} from '../../Utils/hooks/useAppDispatch';
import {postsApi} from '../../APIServices/posts/postsApi';
import {SyncManager} from '../../APIServices/offline/SyncManager';
import {QueueManager} from '../../APIServices/offline/QueueManager';
import {Logger} from '../../Utils/logger';
import {Skeleton} from '../common/Skeleton';

interface Props {
  post: Post & {
    views?: number;
    replies?: number;
    tag?: string;
    isBookmarked?: boolean;
  };
  onPress?: () => void;
  onBookmarkPress?: (id: string) => void;
  onOptionsPress?: (post: Post) => void;
  isDetail?: boolean;
}

const getAvatarBg = (name: string) => {
  const char = name.charAt(0).toUpperCase();
  if (char < 'H') return '#E8F5E9';
  if (char < 'P') return '#F3E8FF';
  return '#E0F2FE';
};

const getAvatarColor = (name: string) => {
  const char = name.charAt(0).toUpperCase();
  if (char < 'H') return '#10B981';
  if (char < 'P') return '#8B5CF6';
  return '#003580';
};

const getTagStyle = (tag: string) => {
  switch (tag) {
    case 'Best Practices':
      return {bg: '#F5F3FF', text: '#8B5CF6'};
    case 'Performance':
      return {bg: '#ECFDF5', text: '#10B981'};
    case 'Architecture':
      return {bg: '#FFF7ED', text: '#F97316'};
    default:
      return {bg: '#EFF6FF', text: '#3B82F6'};
  }
};

export const PostCard: React.FC<Props> = React.memo(({
  post,
  onPress,
  onBookmarkPress,
  onOptionsPress,
}) => {
  const {colors, typography, borderRadius, dark} = useTheme();
  const dispatch = useAppDispatch();
  const {onPressIn, onPressOut, animatedStyle} = usePressAnimation();

  const handleRetry = React.useCallback(() => {
    Logger.info(`Manual retry triggered for post: ${post.clientPostId || post.id}`, 'PostCard');
    const queue = QueueManager.getQueue();
    const queueItem = queue.find(
      item =>
        item.type === 'CREATE_POST' &&
        (item.payload as any)?.postData?.clientPostId === post.clientPostId,
    );

    if (queueItem) {
      QueueManager.resetRetries(queueItem.id);

      const updateStatus = (draft: Post[]) => {
        if (Array.isArray(draft)) {
          const item = draft.find(p => p.id === post.id || p.clientPostId === post.clientPostId);
          if (item) {
            item.isFailed = false;
            item.isPending = true;
          }
        }
      };

      dispatch(
        postsApi.util.updateQueryData('getPosts', {communityId: post.communityId}, updateStatus),
      );
      dispatch(postsApi.util.updateQueryData('getPosts', {}, updateStatus));

      SyncManager.sync().catch(err => {
        Logger.error('Failed to trigger manual sync', 'PostCard', err);
      });
    }
  }, [post.id, post.clientPostId, post.communityId, dispatch]);

  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const tagStyle = getTagStyle(post.tag || 'General');

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button">
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: dark ? 'rgba(30, 41, 59, 0.55)' : '#FFFFFF',
            borderColor: colors.border,
            borderRadius: borderRadius.md || 12,
          },
          animatedStyle,
        ]}>
        <View style={styles.headerRow}>
          <View style={styles.authorRow}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: getAvatarBg(post.authorName || 'User')},
              ]}>
              <Text
                style={[
                  styles.avatarText,
                  {color: getAvatarColor(post.authorName || 'User')},
                ]}>
                {(post.authorName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.meta}>
              <Text style={[styles.authorName, {color: colors.text}]}>
                {post.authorName || 'Anonymous'}
              </Text>
              <Text style={[styles.dateText, {color: colors.textSecondary}]}>
                {formatPostDate(post.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.rightHeaderControls}>
            {post.isPending && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: post.isFailed ? colors.errorLight : colors.warningLight,
                    borderRadius: borderRadius.sm,
                  },
                ]}>
                {post.isFailed ? (
                  <TouchableOpacity
                    onPress={handleRetry}
                    style={styles.retryBadgeButton}
                    activeOpacity={0.7}
                    accessibilityRole="button">
                    <Icon name="refresh" size={10} color={colors.error} />
                    <Text
                      style={[
                        typography.caption,
                        {color: colors.error, marginLeft: 4, fontWeight: '700'},
                      ]}>
                      Retry Sync
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.syncingRow}>
                    <Skeleton width={8} height={8} borderRadius={4} style={styles.mr} />
                    <Text
                      style={[
                        typography.caption,
                        {color: colors.warning, fontWeight: '700'},
                      ]}>
                      Syncing...
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.actionButtons}>
              {onOptionsPress && (
                <TouchableOpacity
                  onPress={() => onOptionsPress(post)}
                  style={styles.iconBtn}
                  activeOpacity={0.7}>
                  <Icon name="ellipsis-horizontal" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
              {onBookmarkPress && (
                <TouchableOpacity
                  onPress={() => onBookmarkPress(post.id)}
                  style={[styles.iconBtn, {marginLeft: wp('2.5%')}]}
                  activeOpacity={0.7}>
                  <Icon
                    name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={post.isBookmarked ? '#3B82F6' : '#94A3B8'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.bodyContent}>
          <Text style={[styles.titleText, {color: colors.text}]} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={[styles.bodyText, {color: colors.textSecondary}]} numberOfLines={2}>
            {post.content}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.statsGroup}>
            <View style={styles.statItem}>
              <Icon name="chatbubble-outline" size={13} color="#94A3B8" />
              <Text style={styles.statText}>{post.replies ?? 0} Replies</Text>
            </View>
            <View style={[styles.statItem, {marginLeft: wp('4%')}]}>
              <Icon name="eye-outline" size={14} color="#94A3B8" />
              <Text style={styles.statText}>{post.views ?? 0} Views</Text>
            </View>
          </View>

          <View style={[styles.tagBadge, {backgroundColor: tagStyle.bg}]}>
            <Text style={[styles.tagText, {color: tagStyle.text}]}>{post.tag || 'General'}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  card: {
    padding: wp('4%'),
    marginVertical: hp('0.8%'),
    borderWidth: 1.5,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: wp('4%'),
    fontWeight: '800',
  },
  meta: {
    marginLeft: wp('3%'),
  },
  authorName: {
    fontSize: wp('3.6%'),
    fontWeight: '700',
  },
  dateText: {
    fontSize: wp('2.8%'),
    marginTop: hp('0.2%'),
  },
  rightHeaderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mr: {
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 2,
  },
  bodyContent: {
    marginTop: hp('1.2%'),
  },
  titleText: {
    fontSize: wp('4%'),
    fontWeight: '700',
    lineHeight: 20,
  },
  bodyText: {
    fontSize: wp('3.3%'),
    marginTop: hp('0.5%'),
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1.5%'),
    paddingTop: hp('1%'),
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: wp('3%'),
    color: '#64748B',
    marginLeft: wp('1.5%'),
    fontWeight: '500',
  },
  tagBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.4%'),
    borderRadius: 8,
  },
  tagText: {
    fontSize: wp('2.8%'),
    fontWeight: '700',
  },
});
