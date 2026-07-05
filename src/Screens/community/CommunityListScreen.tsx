import React, {useCallback, useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  Image,
} from 'react-native';
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
import {CommunityStackParamList, Community} from '../../Constance/globalTypes';
import {useCommunities} from './hooks/useCommunities';
import {CommunityCard} from '../../Components/community/CommunityCard';
import {SearchBar} from '../../Components/community/SearchBar';
import {FilterBottomSheet} from '../../Components/community/FilterBottomSheet';
import {LoadingSkeleton} from '../../Components/community/LoadingSkeleton';
import {PaginationLoader} from '../../Components/community/PaginationLoader';
import {OfflineCard} from '../../Components/community/OfflineCard';
import {RetryCard} from '../../Components/community/RetryCard';
import {EmptyState} from '../../Components/common/EmptyState';
import {GlassBackground} from '../../Components/common/GlassBackground';
import {useAuth} from '../auth/hooks/useAuth';
import {useToast} from '../../Components/common/ToastContext';
import {
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from '../../APIServices/community/communityApi';

type NavigationProp = NativeStackNavigationProp<CommunityStackParamList, 'CommunityList'>;

export const CommunityListScreen = () => {
  const {colors, typography, borderRadius} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const flashListRef = useRef<FlashList<Community>>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const scrollOffsetRef = useRef(0);
  const {isAuthenticated} = useAuth();
  const {showToast} = useToast();

  const [joinTrigger] = useJoinCommunityMutation();
  const [leaveTrigger] = useLeaveCommunityMutation();

  const {
    communities,
    localSearch,
    setLocalSearch,
    sortBy,
    filterType,
    scrollOffset,
    isLoading,
    isFetchingMore,
    isRefreshing,
    isOffline,
    error,
    hasMore,
    handleRefresh,
    handleLoadMore,
    handleSaveScrollOffset,
    handleSortChange,
    handleFilterChange,
    refetch,
  } = useCommunities();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technology' | 'design' | 'business'>('all');

  const getCommunityCategory = (item: Community): 'technology' | 'design' | 'business' => {
    const name = item.name.toLowerCase();
    if (
      name.includes('design') ||
      name.includes('creative') ||
      name.includes('figma') ||
      name.includes('webgl') ||
      name.includes('art')
    ) {
      return 'design';
    }
    if (
      name.includes('product') ||
      name.includes('startup') ||
      name.includes('business') ||
      name.includes('freelance') ||
      name.includes('ecosystem')
    ) {
      return 'business';
    }
    return 'technology';
  };

  const filteredCommunities = communities.filter(c => {
    if (selectedCategory === 'all') return true;
    return getCommunityCategory(c) === selectedCategory;
  });

  useEffect(() => {
    if (communities.length > 0 && scrollOffset > 0) {
      const scrollTimer = setTimeout(() => {
        flashListRef.current?.scrollToOffset({
          offset: scrollOffset,
          animated: false,
        });
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [scrollOffset, communities.length]);

  const handleCardPress = useCallback(
    (communityId: string) => {
      handleSaveScrollOffset(scrollOffsetRef.current);
      navigation.navigate('CommunityDetails', {communityId});
    },
    [navigation, handleSaveScrollOffset],
  );

  const handleJoinPress = useCallback(
    async (community: Community) => {
      if (!isAuthenticated) {
        showToast('Please login to join this community!', 'error');
        return;
      }
      try {
        if (community.isJoined) {
          await leaveTrigger(community.id).unwrap();
          showToast(`Left ${community.name}`, 'info');
        } else {
          await joinTrigger(community.id).unwrap();
          showToast(`Joined ${community.name}!`, 'success');
        }
        refetch();
      } catch (err: any) {
        const errMsg = err?.message || err?.error?.message || '';
        if (errMsg.includes('Offline') || errMsg.includes('queued')) {
          showToast('Offline mode. Request queued.', 'success');
        } else {
          showToast('Action failed. Please try again.', 'error');
        }
      }
    },
    [isAuthenticated, joinTrigger, leaveTrigger, showToast, refetch],
  );

  const renderCommunityItem = useCallback(
    ({item}: {item: Community}) => (
      <CommunityCard community={item} onPress={handleCardPress} onJoinPress={handleJoinPress} />
    ),
    [handleCardPress, handleJoinPress],
  );

  const keyExtractor = useCallback((item: Community) => item.id, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    handleSaveScrollOffset(scrollOffsetRef.current);
  }, [handleSaveScrollOffset]);

  const handleMomentumScrollEnd = useCallback(() => {
    handleSaveScrollOffset(scrollOffsetRef.current);
  }, [handleSaveScrollOffset]);

  const toggleFilterSheet = useCallback(() => {
    setFilterVisible(prev => !prev);
  }, []);

  const featuredList = [
    {
      id: 'c8',
      name: 'AI & Machine Learning Hub',
      members: '4,200 members',
      bgColor: '#E0F2FE',
      iconBg: '#3B82F6',
      iconName: 'bulb-outline',
    },
    {
      id: 'c1',
      name: 'Angular Enterprise [#18]',
      members: '816 members',
      bgColor: '#F3E8FF',
      iconBg: '#8B5CF6',
      iconName: 'code-slash-outline',
    },
    {
      id: 'c5',
      name: 'Creative Design Studio',
      members: '1,245 members',
      bgColor: '#FFEDD5',
      iconBg: '#F97316',
      iconName: 'color-palette-outline',
    },
  ];

  const categoryTabs = [
    {id: 'all', label: 'All', icon: 'grid-outline'},
    {id: 'technology', label: 'Technology', icon: 'code-slash-outline'},
    {id: 'design', label: 'Design', icon: 'color-palette-outline'},
    {id: 'business', label: 'Business', icon: 'briefcase-outline'},
  ] as const;

  const renderHeaderComponent = () => (
    <View style={styles.headerSectionContainer}>
      <View style={styles.featuredHeaderRow}>
        <View style={styles.titleWithIcon}>
          <Icon name="sparkles" size={16} color="#EAB308" style={styles.headerSparkleIcon} />
          <Text style={[typography.h3, {color: colors.text, fontWeight: '700'}]}>
            Featured Communities
          </Text>
        </View>
        <TouchableOpacity onPress={() => setSelectedCategory('all')} activeOpacity={0.7}>
          <Text style={[typography.caption, {color: colors.primary, fontWeight: '700'}]}>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScrollContent}>
        {featuredList.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleCardPress(item.id)}
            style={[styles.featuredCard, {backgroundColor: item.bgColor}]}
            activeOpacity={0.95}>
            <View style={styles.boltBadge}>
              <Icon name="flash" size={11} color="#CA8A04" />
            </View>

            <View style={[styles.featuredIconBox, {backgroundColor: item.iconBg}]}>
              <Icon name={item.iconName} size={22} color="#FFFFFF" />
            </View>

            <View style={styles.featuredMeta}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.featuredMembersRow}>
                <Icon name="people-outline" size={12} color="#64748B" />
                <Text style={styles.featuredMembersText}>{item.members}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.listHeaderRow}>
        <Text style={[typography.h3, {color: colors.text, fontWeight: '700'}]}>
          All Communities
        </Text>
        <TouchableOpacity style={styles.sortBtn} onPress={toggleFilterSheet} activeOpacity={0.7}>
          <Text style={[typography.caption, {color: colors.textSecondary, fontWeight: '600'}]}>
            Sort by: Popular
          </Text>
          <Icon name="chevron-down" size={12} color={colors.textSecondary} style={styles.sortIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <GlassBackground>
        <SafeAreaView
          style={[styles.container, {backgroundColor: 'transparent', paddingHorizontal: wp('4%')}]}
          edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <View>
              <Text style={[typography.h2, {color: colors.text, fontWeight: '800'}]}>
                Communities
              </Text>
              <Text style={[typography.caption, {color: colors.textSecondary, marginTop: hp('0.2%')}]}>
                Discover, join and grow together
              </Text>
            </View>
          </View>
          <SearchBar value={localSearch} onChangeText={setLocalSearch} style={styles.searchBar} />
          <LoadingSkeleton />
        </SafeAreaView>
      </GlassBackground>
    );
  }

  if (error && communities.length === 0) {
    return (
      <GlassBackground>
        <SafeAreaView
          style={[styles.container, {backgroundColor: 'transparent'}]}
          edges={['top', 'left', 'right']}>
          <RetryCard onRetry={handleRefresh} />
        </SafeAreaView>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <SafeAreaView
        style={[styles.container, {backgroundColor: 'transparent'}]}
        edges={['top', 'left', 'right']}>
        <View style={styles.mainWrapper}>
          <View style={[styles.header, {paddingHorizontal: wp('4%')}]}>
            <View>
              <Text style={[typography.h2, {color: colors.text, fontWeight: '800'}]}>
                Communities
              </Text>
              <Text style={[typography.caption, {color: colors.textSecondary, marginTop: hp('0.2%')}]}>
                Discover, join and grow together
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.filterIconBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                },
              ]}
              onPress={toggleFilterSheet}
              activeOpacity={0.8}>
              <Icon name="options-outline" size={20} color={colors.primary} />
              {(filterType !== 'all' || sortBy !== 'name') && (
                <View style={[styles.activeFilterDot, {backgroundColor: colors.primary}]} />
              )}
            </TouchableOpacity>
          </View>

          <SearchBar
            value={localSearch}
            onChangeText={setLocalSearch}
            style={StyleSheet.flatten([styles.searchBar, {marginHorizontal: wp('4%')}])}
          />

          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}>
              {categoryTabs.map(tab => {
                const active = selectedCategory === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setSelectedCategory(tab.id)}
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

          <View style={styles.listWrapper}>
            <FlashList
              ref={flashListRef}
              data={filteredCommunities}
              renderItem={renderCommunityItem}
              keyExtractor={keyExtractor}
              estimatedItemSize={hp('12.5%')}
              onScroll={handleScroll}
              onScrollEndDrag={handleScrollEndDrag}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListHeaderComponent={renderHeaderComponent}
              ListFooterComponent={<PaginationLoader isLoading={isFetchingMore} hasMore={hasMore} />}
              ListEmptyComponent={
                <EmptyState
                  title="No Communities Found"
                  description={
                    localSearch
                      ? "We couldn't find any communities matching your search terms."
                      : 'There are no communities available at this moment.'
                  }
                  actionLabel={localSearch ? 'Clear Search' : 'Refresh'}
                  onAction={localSearch ? () => setLocalSearch('') : handleRefresh}
                />
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        <FilterBottomSheet
          visible={filterVisible}
          onClose={toggleFilterSheet}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          filterType={filterType}
          onFilterChange={handleFilterChange}
        />
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  filterIconBtn: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 6,
    right: 6,
  },
  searchBar: {
    marginBottom: hp('1.5%'),
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
    paddingBottom: hp('4%'),
  },
  headerSectionContainer: {
    marginBottom: hp('1.5%'),
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  featuredScrollContent: {
    paddingBottom: hp('1%'),
  },
  featuredCard: {
    width: wp('42%'),
    height: hp('14.5%'),
    borderRadius: 16,
    padding: wp('3%'),
    marginRight: wp('4%'),
    position: 'relative',
    justifyContent: 'space-between',
  },
  boltBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSparkleIcon: {
    marginRight: 6,
  },
  featuredIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredMeta: {
    marginTop: hp('1%'),
  },
  featuredTitle: {
    fontSize: wp('3.6%'),
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  featuredMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.4%'),
  },
  featuredMembersText: {
    fontSize: wp('2.8%'),
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortIcon: {
    marginLeft: 4,
  },
});
