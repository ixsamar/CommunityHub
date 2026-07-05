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
  Image,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Animated, {FadeInLeft, FadeOutRight} from 'react-native-reanimated';
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
  category: 'messages' | 'businesses' | 'workforce' | 'activities' | 'system';
  createdAt: string;
  isRead: boolean;
  avatarUrl?: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  overlayIcon?: string;
  overlayColor?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Comment on Profile',
    body: 'Aarav Sharma left a comment: "Great acting skills shown in the last video audition!"',
    category: 'workforce',
    createdAt: '2026-07-02T10:00:00Z',
    isRead: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    iconName: 'chatbubble',
    iconColor: '#EF4444',
    iconBgColor: '#FEE2E2',
    overlayIcon: 'chatbubble',
    overlayColor: '#FFB020',
  },
  {
    id: 'n2',
    title: 'Comment on Caravan booking',
    body: 'Priya Malhotra commented: "Please ensure the vanity mirrors have white LED lighting."',
    category: 'messages',
    createdAt: '2026-07-02T09:00:00Z',
    isRead: false,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    iconName: 'chatbubble',
    iconColor: '#EF4444',
    iconBgColor: '#FEE2E2',
    overlayIcon: 'chatbubble',
    overlayColor: '#10B981',
  },
  {
    id: 'n3',
    title: 'New Actor Match',
    body: 'You matched with Amit Patel (Choreographer) for the upcoming Telugu musical.',
    category: 'workforce',
    createdAt: '2026-07-02T08:00:00Z',
    isRead: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    iconName: 'people',
    iconColor: '#F59E0B',
    iconBgColor: '#FEF3C7',
    overlayIcon: 'people',
    overlayColor: '#FFB020',
  },
  {
    id: 'n4',
    title: 'Shoot Bus Booking',
    body: 'Suresh Reddy booked your Lux Shoot Bus for Mythri Movie Makers shoot in Gandipet.',
    category: 'businesses',
    createdAt: '2026-07-02T07:00:00Z',
    isRead: false,
    iconName: 'bus',
    iconColor: '#10B981',
    iconBgColor: '#D1FAE5',
  },
  {
    id: 'n5',
    title: 'Payment Received',
    body: '₹75,000 received from Vyjayanthi Movies for Caravan rental.',
    category: 'activities',
    createdAt: '2026-07-01T15:00:00Z',
    isRead: true,
    iconName: 'wallet',
    iconColor: '#8B5CF6',
    iconBgColor: '#EDE9FE',
  },
  {
    id: 'n6',
    title: 'Comment on Audition Video',
    body: 'Director Sukumar commented: "Excellent screen presence. Please come to Jubilee Hills office for a look test."',
    category: 'system',
    createdAt: '2026-07-01T14:00:00Z',
    isRead: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    iconName: 'camera',
    iconColor: '#F59E0B',
    iconBgColor: '#FEF3C7',
    overlayIcon: 'people',
    overlayColor: '#FFB020',
  },
  {
    id: 'n7',
    title: 'New Message from Vikram',
    body: 'Vikram: "Is the vintage Royal Enfield bike available for the pre-wedding shoot tomorrow?"',
    category: 'messages',
    createdAt: '2026-07-01T12:00:00Z',
    isRead: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    iconName: 'chatbubble',
    iconColor: '#EF4444',
    iconBgColor: '#FEE2E2',
    overlayIcon: 'chatbubble',
    overlayColor: '#10B981',
  },
];

export const NotificationScreen = () => {
  const {colors, typography, borderRadius, dark} = useTheme();
  const {showToast} = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'messages' | 'businesses' | 'workforce' | 'activities' | 'system'>('all');

  const loadNotifications = useCallback(() => {
    const raw = storage.getString('mock_notifications');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.length > 0 && !parsed[0].category) {
          throw new Error('migration needed');
        }
        setNotifications(parsed);
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

  const getFilteredData = () => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.category === activeFilter);
  };

  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return notifications.length;
    return notifications.filter(n => n.category === cat).length;
  };

  const getGroupedNotifications = () => {
    const filtered = getFilteredData();
    const groups: {title: string; data: NotificationItem[]}[] = [
      {title: 'Older Notifications', data: []},
    ];

    filtered.forEach(item => {
      groups[0].data.push(item);
    });

    return groups.filter(g => g.data.length > 0);
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

  const filterTabs = [
    {id: 'all', label: 'All', icon: 'notifications', activeColor: colors.primary, textColor: '#00B2FE'},
    {id: 'messages', label: 'Messages', icon: 'chatbubble-ellipses', activeColor: '#EF4444', textColor: '#EF4444'},
    {id: 'businesses', label: 'Businesses', icon: 'bus', activeColor: '#10B981', textColor: '#10B981'},
    {id: 'workforce', label: 'Workforce', icon: 'people', activeColor: '#F59E0B', textColor: '#F59E0B'},
    {id: 'activities', label: 'Activities', icon: 'sparkles', activeColor: '#8B5CF6', textColor: '#8B5CF6'},
    {id: 'system', label: 'System', icon: 'shield-checkmark', activeColor: '#3B82F6', textColor: '#3B82F6'},
  ] as const;

  const grouped = getGroupedNotifications();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <GlassBackground>
      <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={[typography.h2, {color: colors.text, fontWeight: '800'}]}>All Notifications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[styles.actionBtn, {borderColor: colors.border, marginRight: wp('2%')}]}
              activeOpacity={0.7}>
              <Icon name="refresh-outline" size={17} color={colors.text} />
            </TouchableOpacity>
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={[styles.markAllBtn, {borderColor: colors.border}]}
                activeOpacity={0.7}>
                <Icon name="checkmark" size={15} color={colors.primary} style={styles.mr} />
                <Text style={[typography.caption, {color: colors.text, fontWeight: '700'}]}>
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}>
            {filterTabs.map(tab => {
              const active = activeFilter === tab.id;
              const count = getCategoryCount(tab.id);
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveFilter(tab.id)}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: active ? tab.activeColor : colors.surface,
                      borderColor: active ? tab.activeColor : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}>
                  <Icon
                    name={tab.icon}
                    size={14}
                    color={active ? '#FFFFFF' : tab.textColor}
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
                    {tab.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
                title: 'New Comment on Profile',
                body: 'Aarav Sharma left a comment: "Great acting skills shown in the last video audition!"',
                category: 'workforce',
                createdAt: new Date().toISOString(),
                isRead: false,
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                iconName: 'chatbubble',
                iconColor: '#EF4444',
                iconBgColor: '#FEE2E2',
                overlayIcon: 'chatbubble',
                overlayColor: '#FFB020',
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
                    typography.caption,
                    {
                      color: colors.textSecondary,
                      fontWeight: '700',
                      marginVertical: hp('1.2%'),
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    },
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
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}>
                    {!item.isRead && (
                      <View style={[styles.blueBarLeft, {backgroundColor: '#00B2FE'}]} />
                    )}

                    <TouchableOpacity
                      onPress={() => handleToggleRead(item.id)}
                      onLongPress={() => handleDelete(item.id)}
                      style={styles.cardInner}
                      activeOpacity={0.9}>
                      <View style={styles.avatarContainer}>
                        {item.avatarUrl ? (
                          <Image source={{uri: item.avatarUrl}} style={styles.avatar} />
                        ) : (
                          <View style={[styles.avatarPlaceholder, {backgroundColor: item.iconBgColor}]}>
                            <Icon name={item.iconName} size={18} color={item.iconColor} />
                          </View>
                        )}
                        {item.avatarUrl && item.overlayIcon && (
                          <View style={[styles.avatarOverlay, {backgroundColor: item.overlayColor || colors.primary}]}>
                            <Icon name={item.overlayIcon} size={9} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      <View style={styles.textContainer}>
                        <View style={styles.cardHeader}>
                          <Text style={[styles.cardTitle, {color: colors.text}]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <View style={styles.metaRow}>
                            <Text style={[typography.caption, {color: colors.textSecondary}]}>
                              {formatDate(item.createdAt)}
                            </Text>
                            {!item.isRead && (
                              <View style={styles.blueDotRight} />
                            )}
                          </View>
                        </View>
                        <Text style={[typography.bodySmall, {color: colors.textSecondary, marginTop: hp('0.5%'), lineHeight: 17}]}>
                          {item.body}
                        </Text>
                      </View>
                    </TouchableOpacity>
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
    paddingVertical: hp('1.8%'),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: hp('0.6%'),
    paddingHorizontal: wp('3.5%'),
  },
  mr: {
    marginRight: 4,
  },
  tabsContainer: {
    marginBottom: hp('1%'),
  },
  tabsScrollContent: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.5%'),
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
    marginBottom: hp('1.5%'),
  },
  card: {
    marginVertical: hp('0.6%'),
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  blueBarLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
    zIndex: 10,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: wp('4%'),
  },
  avatarContainer: {
    position: 'relative',
    marginTop: hp('0.3%'),
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '700',
    flex: 1,
    paddingRight: wp('2%'),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blueDotRight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B2FE',
    marginLeft: wp('1.8%'),
  },
});
