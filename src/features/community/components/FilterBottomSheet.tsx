import React, {useEffect} from 'react';
import {StyleSheet, Text, View, Modal, TouchableOpacity, Pressable} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import {useTheme} from '../../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  sortBy: 'name' | 'members' | 'recent';
  onSortChange: (sort: 'name' | 'members' | 'recent') => void;
  filterType: 'all' | 'public' | 'private';
  onFilterChange: (filter: 'all' | 'public' | 'private') => void;
}

export const FilterBottomSheet: React.FC<Props> = React.memo(({
  visible,
  onClose,
  sortBy,
  onSortChange,
  filterType,
  onFilterChange,
}) => {
  const {colors, typography, spacing} = useTheme();

  // Reanimated shared values
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(hp('50%'));

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(0.4, {duration: 200});
      sheetTranslateY.value = withSpring(0, {
        damping: 18,
        stiffness: 120,
      });
    } else {
      backdropOpacity.value = withTiming(0, {duration: 200});
      sheetTranslateY.value = withTiming(hp('50%'), {duration: 200});
    }
  }, [visible, backdropOpacity, sheetTranslateY]);

  const handleClose = () => {
    backdropOpacity.value = withTiming(0, {duration: 150});
    sheetTranslateY.value = withTiming(hp('50%'), {duration: 150});
    setTimeout(() => {
      onClose();
    }, 160);
  };

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: sheetTranslateY.value}],
  }));

  const sortOptions = [
    {value: 'name', label: 'Alphabetical (A-Z)', icon: 'text-outline'},
    {value: 'members', label: 'Popularity (Members)', icon: 'people-outline'},
    {value: 'recent', label: 'Recently Created', icon: 'time-outline'},
  ] as const;

  const filterOptions = [
    {value: 'all', label: 'All Communities', icon: 'grid-outline'},
    {value: 'public', label: 'Public Only', icon: 'eye-outline'},
    {value: 'private', label: 'Private Only', icon: 'lock-closed-outline'},
  ] as const;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Animated Backdrop */}
        <Animated.View style={[styles.backdrop, {backgroundColor: '#000000'}, animatedBackdropStyle]}>
          <Pressable style={styles.flexOne} onPress={handleClose} />
        </Animated.View>

        {/* Slide Up Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              padding: spacing.lg || wp('6%'),
            },
            animatedSheetStyle,
          ]}>
          {/* Drag Handle Indicator */}
          <View style={[styles.dragHandle, {backgroundColor: colors.border}]} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[typography.h3, {color: colors.text}]}>Sort & Filter</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7} style={styles.closeBtn}>
              <Icon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Filter Section */}
          <View style={styles.section}>
            <Text style={[typography.bodyMedium, {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('1.5%')}]}>
              FILTER BY
            </Text>
            <View style={styles.optionsList}>
              {filterOptions.map((opt) => {
                const active = filterType === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                        borderRadius: 8,
                        paddingVertical: hp('1.2%'),
                        paddingHorizontal: wp('3%'),
                      },
                    ]}
                    onPress={() => onFilterChange(opt.value)}
                    activeOpacity={0.8}>
                    <View style={styles.optionInfo}>
                      <Icon name={opt.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
                      <Text style={[typography.bodyMedium, {color: active ? colors.primary : colors.text, marginLeft: wp('3%'), fontWeight: active ? '600' : '400'}]}>
                        {opt.label}
                      </Text>
                    </View>
                    {active && <Icon name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Sort Section */}
          <View style={styles.section}>
            <Text style={[typography.bodyMedium, {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('1.5%')}]}>
              SORT BY
            </Text>
            <View style={styles.optionsList}>
              {sortOptions.map((opt) => {
                const active = sortBy === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: active ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                        borderRadius: 8,
                        paddingVertical: hp('1.2%'),
                        paddingHorizontal: wp('3%'),
                      },
                    ]}
                    onPress={() => onSortChange(opt.value)}
                    activeOpacity={0.8}>
                    <View style={styles.optionInfo}>
                      <Icon name={opt.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
                      <Text style={[typography.bodyMedium, {color: active ? colors.primary : colors.text, marginLeft: wp('3%'), fontWeight: active ? '600' : '400'}]}>
                        {opt.label}
                      </Text>
                    </View>
                    {active && <Icon name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Footer Action */}
          <TouchableOpacity
            style={[styles.applyButton, {backgroundColor: colors.primary}]}
            onPress={handleClose}
            activeOpacity={0.9}>
            <Text style={[typography.bodyMedium, {color: '#ffffff', fontWeight: '700'}]}>Apply Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
});

FilterBottomSheet.displayName = 'FilterBottomSheet';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  flexOne: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  dragHandle: {
    width: wp('12%'),
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: hp('1.5%'),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    marginVertical: hp('1%'),
  },
  optionsList: {
    marginTop: hp('0.5%'),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: hp('0.3%'),
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: hp('1.5%'),
  },
  applyButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.8%'),
    marginTop: hp('2.5%'),
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
});
