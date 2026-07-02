import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {LazyImage} from '../common/LazyImage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../Utils/themeIndex';
import {Post} from '../../Constance/globalTypes';
import {useAppDispatch} from '../../Utils/hooks/useAppDispatch';
import {postsApi} from '../../APIServices/posts/postsApi';
import {SyncManager} from '../../APIServices/offline/SyncManager';
import {QueueManager} from '../../APIServices/offline/QueueManager';
import {Logger} from '../../Utils/logger';

interface Props {
  post: Post;
}

export const PostCard: React.FC<Props> = React.memo(({post}) => {
  const {colors, typography, spacing, borderRadius} = useTheme();
  const dispatch = useAppDispatch();

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
    } else {
      Logger.warn(`Queue item not found for post clientPostId: ${post.clientPostId}`, 'PostCard');
    }
  }, [post.id, post.clientPostId, post.communityId, dispatch]);

  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const statusInfo = post.isPending
    ? post.isFailed
      ? 'Sync failed. Will retry automatically.'
      : 'Syncing in progress.'
    : '';
  const accessibilityLabel = `Post by ${post.authorName} on ${formatPostDate(post.createdAt)}. Title: ${post.title}. Content: ${post.content}. ${statusInfo}`;

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: spacing.md || wp('4%'),
          marginVertical: hp('0.8%'),
          shadowColor: colors.shadow,
          borderRadius: borderRadius.lg,
        },
      ]}>
      {}
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
          <View
            style={[
              styles.avatar,
              {backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full},
            ]}>
            <Text
              maxFontSizeMultiplier={1.2}
              style={[typography.caption, {color: colors.primary, fontWeight: '700'}]}>
              {post.authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text
              maxFontSizeMultiplier={1.3}
              style={[typography.bodySmall, {color: colors.text, fontWeight: '600'}]}>
              {post.authorName}
            </Text>
            <Text
              maxFontSizeMultiplier={1.2}
              style={[typography.caption, {color: colors.textSecondary, fontSize: 10}]}>
              {formatPostDate(post.createdAt)}
            </Text>
          </View>
        </View>

        {}
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
                accessibilityRole="button"
                accessibilityLabel="Retry failed post sync">
                <Icon name="refresh" size={10} color={colors.error} />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={[
                    typography.caption,
                    {color: colors.error, marginLeft: 4, fontWeight: '700'},
                  ]}>
                  Retry Sync
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <ActivityIndicator size="small" color={colors.warning} style={styles.spinner} />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={[
                    typography.caption,
                    {color: colors.warning, marginLeft: 4, fontWeight: '700'},
                  ]}>
                  Syncing...
                </Text>
              </>
            )}
          </View>
        )}
      </View>

      {}
      <Text
        maxFontSizeMultiplier={1.3}
        style={[
          typography.h3,
          {color: colors.text, marginTop: hp('1.2%'), marginBottom: hp('0.6%'), fontSize: 16},
        ]}>
        {post.title}
      </Text>

      {}
      <Text
        maxFontSizeMultiplier={1.3}
        style={[typography.bodyMedium, {color: colors.text, lineHeight: 20}]}>
        {post.content}
      </Text>

      {}
      {post.images && post.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachedImagesScroll}
          contentContainerStyle={styles.attachedImagesScrollContent}>
          {post.images.map((uri, index) => (
            <View
              key={uri + index}
              style={[
                styles.attachedImageContainer,
                {borderColor: colors.border, borderRadius: borderRadius.md || 8},
              ]}>
              <LazyImage source={{uri}} style={styles.attachedImage} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('4.25%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    marginLeft: wp('2.5%'),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  spinner: {
    transform: [{scale: 0.7}],
  },
  retryBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachedImagesScroll: {
    marginTop: hp('1.2%'),
  },
  attachedImagesScrollContent: {
    alignItems: 'center',
  },
  attachedImageContainer: {
    width: wp('24%'),
    height: wp('24%'),
    borderWidth: 1,
    marginRight: wp('3%'),
    overflow: 'hidden',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
});
