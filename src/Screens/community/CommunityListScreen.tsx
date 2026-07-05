import React, {useCallback, useRef, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
import {CommunityStackParamList} from '../../Constance/globalTypes';
import {useCommunities} from './hooks/useCommunities';
import {CommunityCard} from '../../Components/community/CommunityCard';
import {SearchBar} from '../../Components/community/SearchBar';
import {FilterBottomSheet} from '../../Components/community/FilterBottomSheet';
import {LoadingSkeleton} from '../../Components/community/LoadingSkeleton';
import {PaginationLoader} from '../../Components/community/PaginationLoader';
import {OfflineCard} from '../../Components/community/OfflineCard';
import {RetryCard} from '../../Components/community/RetryCard';
import {EmptyState} from '../../Components/common/EmptyState';
import {Community} from '../../Constance/globalTypes';
import {PerformanceMonitor} from '../../Utils/performance';
import {GlassBackground} from '../../Components/common/GlassBackground';

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

  useEffect(() => {
    const trace = PerformanceMonitor.startTrace('CommunityListScreenMount');
    return () => trace();
  }, []);

  useEffect(() => {
    if (isLoading) {
      const trace = PerformanceMonitor.startTrace('CommunityListScreenLoad');
      return () => trace();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isRefreshing) {
      const trace = PerformanceMonitor.startTrace('CommunityListScreenRefresh');
      return () => trace();
    }
  }, [isRefreshing]);

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

  const renderCommunityItem = useCallback(
    ({item}: {item: Community}) => <CommunityCard community={item} onPress={handleCardPress} />,
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

  if (isLoading) {
    return (
      <GlassBackground>
        <SafeAreaView
          style={[
            styles.container,
            {backgroundColor: 'transparent', paddingHorizontal: wp('4%')},
          ]}
          edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <Text style={[typography.h2, {color: colors.text}]}>Communities</Text>
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
        <View style={[styles.mainWrapper, {paddingHorizontal: wp('4%')}]}>
        {}
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

        {}
        <SearchBar value={localSearch} onChangeText={setLocalSearch} style={styles.searchBar} />

        {}
        {isOffline && <OfflineCard />}

        {}
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

      {}
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
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingBottom: hp('4%'),
  },
});
