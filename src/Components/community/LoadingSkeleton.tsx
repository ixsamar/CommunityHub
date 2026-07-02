import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';
import {Skeleton} from '../common/Skeleton';

export const LoadingSkeleton: React.FC = React.memo(() => {
  const {colors, spacing} = useTheme();

  const dummyCards = Array.from({length: 4});

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      scrollEnabled={false}>
      {dummyCards.map((_, index) => (
        <View
          key={index}
          style={[
            styles.cardPlaceholder,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              padding: spacing.md || wp('4%'),
              marginVertical: hp('0.8%'),
            },
          ]}>
          <View style={styles.row}>
            {}
            <Skeleton width={wp('18%')} height={wp('18%')} borderRadius={10} />

            <View style={styles.textColumn}>
              {}
              <Skeleton width="60%" height={20} borderRadius={4} style={styles.mb} />

              {}
              <Skeleton width="90%" height={14} borderRadius={4} style={styles.mb} />

              {}
              <Skeleton width="75%" height={14} borderRadius={4} style={styles.mb} />

              <View style={styles.footerRow}>
                {}
                <Skeleton width="40%" height={12} borderRadius={3} />
                {}
                <Skeleton width="20%" height={12} borderRadius={3} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardPlaceholder: {
    borderRadius: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  mb: {
    marginBottom: hp('0.8%'),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
});
