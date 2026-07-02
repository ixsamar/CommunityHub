import React, {useCallback, useRef, useEffect, useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {FlashList} from '@shopify/flash-list';
import Icon from 'react-native-vector-icons/Ionicons';

import {useTheme} from '../../../theme';
import {CommunityStackParamList} from '../../../navigation/types';
import {useCommunities} from '../hooks/useCommunities';
import {CommunityCard} from '../components/CommunityCard';
import {SearchBar} from '../components/SearchBar';
import {FilterBottomSheet} from '../components/FilterBottomSheet';
import {LoadingSkeleton} from '../components/LoadingSkeleton';
import {PaginationLoader} from '../components/PaginationLoader';
import {OfflineCard} from '../components/OfflineCard';
import {RetryCard} from '../components/RetryCard';
import {EmptyState} from '../../../common/components/EmptyState';
import {Community} from '../types';

type NavigationProp = NativeStackNavigationProp<CommunityStackParamList, 'CommunityList'>;

export const CommunityListScreen = () => {
  const {colors, typography} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const flashListRef = useRef<FlashList<Community>>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const scrollOffsetRef = useRef(0);

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
  } = useCommunities();

  // Scroll position restoration
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
      // Save current scroll offset to Redux before navigating
      handleSaveScrollOffset(scrollOffsetRef.current);
      navigation.navigate('CommunityDetails', {communityId});
    },
    [navigation, handleSaveScrollOffset],
  );

  const renderCommunityItem = useCallback(
    ({item}: {item: Community}) => (
      <CommunityCard community={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
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

  // Main UI States
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: colors.background, paddingHorizontal: wp('4%')}]}
        edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={[typography.h2, {color: colors.text}]}>Communities</Text>
        </View>
        <SearchBar value={localSearch} onChangeText={setLocalSearch} style={styles.searchBar} />
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (error && communities.length === 0) {
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
        {/* Title and Filter Trigger */}
        <View style={styles.header}>
          <Text style={[typography.h2, {color: colors.text}]}>Communities</Text>
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

        {/* Search */}
        <SearchBar value={localSearch} onChangeText={setLocalSearch} style={styles.searchBar} />

        {/* Offline Cache Indicator */}
        {isOffline && <OfflineCard />}

        {/* List of Communities */}
        <View style={styles.listWrapper}>
          <FlashList
            ref={flashListRef}
            data={communities}
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
            ListFooterComponent={
              <PaginationLoader isLoading={isFetchingMore} hasMore={hasMore} />
            }
            ListEmptyComponent={
              <EmptyState
                title="No Communities Found"
                description={
                  localSearch
                    ? "We couldn't find any communities matching your search terms."
                    : "There are no communities available at this moment."
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

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterVisible}
        onClose={toggleFilterSheet}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        filterType={filterType}
        onFilterChange={handleFilterChange}
      />
    </SafeAreaView>
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
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: hp('4%'),
  },
});
