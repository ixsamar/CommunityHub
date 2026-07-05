import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Animated, {FadeInLeft, FadeOutRight} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';

import {useTheme} from '../../Utils/themeIndex';
import {storage} from '../../Utils/mmkv';
import {useToast} from '../../Components/common/ToastContext';
import {GlassBackground} from '../../Components/common/GlassBackground';
import {Skeleton} from '../../Components/common/Skeleton';
import {EmptyState} from '../../Components/common/EmptyState';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'post_liked' | 'post_comment' | 'community_joined' | 'system';
  createdAt: string;
  isRead: boolean;
  targetId: string;
  targetType: 'post' | 'community' | 'system';
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Member Joined!',
    body: 'Sarah Connor just joined the React Native Enthusiasts community.',
    type: 'community_joined',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
    targetId: 'c_1',
    targetType: 'community',
  },
  {
    id: 'n2',
    title: 'Someone liked your post',
    body: 'Your post "Offline Persistence with MMKV" received a new upvote!',
    type: 'post_liked',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isRead: false,
    targetId: 'p_1',
    targetType: 'post',
  },
  {
    id: 'n3',
    title: 'New post published',
    body: 'David Heinemeier published a new article: "Clean Code Architecture in 2026".',
    type: 'post_comment',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    isRead: true,
    targetId: 'p_2',
    targetType: 'post',
  },
  {
    id: 'n4',
    title: 'Welcome to Community Hub!',
    body: 'Explore local groups, share thoughts, and write amazing posts today.',
    type: 'system',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isRead: true,
    targetId: '',
    targetType: 'system',
  },
];

export const NotificationScreen = () => {
  const theme = useTheme();
  const {colors, typography, borderRadius, dark} = theme;
  const navigation = useNavigation<any>();
  const {showToast} = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const loadNotifications = useCallback(() => {
    const raw = storage.getString('mock_notifications');
    if (raw) {
      try {
        setNotifications(JSON.parse(raw));
      } catch {
        setNotifications(DEFAULT_NOTIFICATIONS);
        storage.set('mock_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
      }
    } else {
      setNotifications(DEFAULT_NOTIFICATIONS);
      storage.set('mock_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    storage.set('mock_notifications', JSON.stringify(items));
  };

  useEffect(() => {
    loadNotifications();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [loadNotifications]);


  useEffect(() => {
    const liveTimer = setTimeout(() => {
      const liveNotif: NotificationItem = {
        id: `n_live_${Date.now()}`,
        title: 'Community sync complete',
        body: 'All local changes have been successfully synchronized with the offline store.',
        type: 'system',
        createdAt: new Date().toISOString(),
        isRead: false,
        targetId: '',
        targetType: 'system',
      };


      let current: NotificationItem[] = [];
      const raw = storage.getString('mock_notifications');
      if (raw) {
        try {
          current = JSON.parse(raw);
        } catch {
          current = DEFAULT_NOTIFICATIONS;
        }
      } else {
        current = DEFAULT_NOTIFICATIONS;
      }


      const updated = [liveNotif, ...current];
      saveNotifications(updated);


      showToast('New notification: Community sync complete!', 'info');
    }, 10000);

    return () => clearTimeout(liveTimer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadNotifications();
      setIsRefreshing(false);
      showToast('Notifications updated!', 'success');
    }, 800);
  };

  const handleToggleRead = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = notifications.map(item =>
      item.id === id ? {...item, isRead: !item.isRead} : item,
    );
    saveNotifications(updated);
  };

  const handleDelete = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = notifications.filter(item => item.id !== id);
    saveNotifications(updated);
    showToast('Notification deleted', 'info');
  };

  const handleMarkAllRead = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = notifications.map(item => ({...item, isRead: true}));
    saveNotifications(updated);
    showToast('All notifications marked as read', 'success');
  };

  const handleClearAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    saveNotifications([]);
    showToast('All notifications cleared', 'info');
  };

  const handleNotificationPress = (item: NotificationItem) => {

    if (!item.isRead) {
      const updated = notifications.map(n => (n.id === item.id ? {...n, isRead: true} : n));
      saveNotifications(updated);
    }


    if (item.targetType === 'community' && item.targetId) {
      navigation.navigate('CommunityTab', {
        screen: 'CommunityDetails',
        params: {communityId: item.targetId},
      });
    } else if (item.targetType === 'post' && item.targetId) {
      navigation.navigate('PostsTab', {
        screen: 'PostDetails',
        params: {postId: item.targetId},
      });
    }
  };


  const getGroupedNotifications = () => {
    const groups: {title: string; data: NotificationItem[]}[] = [
      {title: 'Today', data: []},
      {title: 'Yesterday', data: []},
      {title: 'Older', data: []},
    ];

    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    notifications.forEach(item => {
      const itemDate = new Date(item.createdAt);
      const itemDateStr = itemDate.toDateString();

      if (itemDateStr === todayStr) {
        groups[0].data.push(item);
      } else if (itemDateStr === yesterdayStr) {
        groups[1].data.push(item);
      } else {
        groups[2].data.push(item);
      }
    });

    return groups.filter(g => g.data.length > 0);
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'post_liked':
        return 'heart';
      case 'post_comment':
        return 'chatbubble-ellipses';
      case 'community_joined':
        return 'people';
      default:
        return 'notifications';
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'post_liked':
        return colors.errorLight;
      case 'post_comment':
        return colors.primaryLight;
      case 'community_joined':
        return colors.successLight;
      default:
        return colors.surfaceVariant;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'post_liked':
        return colors.error;
      case 'post_comment':
        return colors.primary;
      case 'community_joined':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map(key => (
        <View
          key={key}
          style={[
            styles.skeletonRow,
            {
              backgroundColor: dark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.55)',
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}>
          <Skeleton width={wp('10%')} height={wp('10%')} borderRadius={wp('5%')} />
          <View style={styles.skeletonMeta}>
            <Skeleton width="45%" height={14} borderRadius={3} style={styles.mb} />
            <Skeleton width="75%" height={10} borderRadius={3} />
          </View>
        </View>
      ))}
    </View>
  );

  const grouped = getGroupedNotifications();

  return (
    <GlassBackground>
      <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['top']}>
        {}
        <View style={[styles.headerRow, {borderBottomColor: colors.border}]}>
          <Text style={[typography.h2, {color: colors.text}]}>Notifications</Text>
          {notifications.length > 0 && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={[styles.actionBtn, {backgroundColor: colors.surfaceVariant, marginRight: wp('2%')}]}
                activeOpacity={0.7}>
                <Icon name="checkmark-done" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearAll}
                style={[styles.actionBtn, {backgroundColor: colors.surfaceVariant}]}
                activeOpacity={0.7}>
                <Icon name="trash" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isLoading ? (
          renderSkeleton()
        ) : notifications.length === 0 ? (
          <EmptyState
            title="All Caught Up!"
            description="You don't have any notifications right now. Check back later for updates."
            actionLabel="Simulate Notification"
            onAction={() => {
              const demo: NotificationItem = {
                id: `n_demo_${Date.now()}`,
                title: 'New community recommendation',
                body: 'Check out "TypeScript Wizards", a community for senior developers.',
                type: 'community_joined',
                createdAt: new Date().toISOString(),
                isRead: false,
                targetId: 'c_1',
                targetType: 'community',
              };
              saveNotifications([demo, ...notifications]);
              showToast('Demo notification added!', 'success');
            }}
          />
        ) : (
          <FlatList
            data={grouped}
            keyExtractor={item => item.title}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            renderItem={({item: group}) => (
              <View style={styles.groupContainer}>
                <Text
                  style={[
                    typography.bodySmall,
                    {color: colors.textSecondary, fontWeight: '700', marginVertical: hp('1%'), textTransform: 'uppercase'},
                  ]}>
                  {group.title}
                </Text>
                {group.data.map(item => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInLeft}
                    exiting={FadeOutRight}
                    style={[
                      styles.card,
                      {
                        backgroundColor: item.isRead
                          ? dark
                            ? 'rgba(30, 41, 59, 0.45)'
                            : 'rgba(255, 255, 255, 0.65)'
                          : dark
                          ? 'rgba(30, 41, 59, 0.7)'
                          : 'rgba(255, 255, 255, 0.95)',
                        borderColor: item.isRead
                          ? dark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.3)'
                          : colors.primary + '30',
                        borderRadius: borderRadius.md,
                        shadowColor: dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 29, 76, 0.04)',
                      },
                    ]}>
                    <TouchableOpacity
                      onPress={() => handleNotificationPress(item)}
                      style={styles.cardContent}
                      activeOpacity={0.8}>
                      {}
                      {!item.isRead && (
                        <View style={[styles.unreadDot, {backgroundColor: colors.primary}]} />
                      )}

                      {}
                      <View style={[styles.iconWrapper, {backgroundColor: getIconBg(item.type)}]}>
                        <Icon name={getIconName(item.type)} size={18} color={getIconColor(item.type)} />
                      </View>

                      {}
                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            typography.bodyMedium,
                            {color: colors.text, fontWeight: item.isRead ? '500' : '700'},
                          ]}
                          numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            typography.bodySmall,
                            {color: colors.textSecondary, marginTop: 2, lineHeight: 16},
                          ]}
                          numberOfLines={2}>
                          {item.body}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {}
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleToggleRead(item.id)}
                        style={[styles.cardActionBtn, {backgroundColor: colors.surfaceVariant}]}
                        accessibilityRole="button"
                        accessibilityLabel={item.isRead ? 'Mark as unread' : 'Mark as read'}>
                        <Icon
                          name={item.isRead ? 'mail-unread-outline' : 'mail-open-outline'}
                          size={15}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        style={[styles.cardActionBtn, {backgroundColor: colors.surfaceVariant, marginLeft: wp('1.5%')}]}
                        accessibilityRole="button"
                        accessibilityLabel="Delete notification">
                        <Icon name="trash-outline" size={15} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1%'),
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    marginVertical: hp('0.6%'),
    borderWidth: 1,
  },
  skeletonMeta: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  mb: {
    marginBottom: 6,
  },
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('4%'),
  },
  groupContainer: {
    marginBottom: hp('1%'),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp('3.5%'),
    marginVertical: hp('0.6%'),
    borderWidth: 1.5,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: -wp('1.5%'),
  },
  iconWrapper: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: wp('3%'),
    paddingRight: wp('2%'),
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionBtn: {
    width: wp('7.5%'),
    height: wp('7.5%'),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
