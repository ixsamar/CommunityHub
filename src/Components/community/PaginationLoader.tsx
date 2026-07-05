import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';
import {Skeleton} from '../common/Skeleton';

interface Props {
  isLoading: boolean;
  hasMore: boolean;
}

export const PaginationLoader: React.FC<Props> = React.memo(({isLoading, hasMore}) => {
  const {colors, typography} = useTheme();

  if (!isLoading && hasMore) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderRow}>
          <Skeleton width={wp('40%')} height={12} borderRadius={3} />
        </View>
      ) : (
        !hasMore && (
          <Text style={[typography.caption, {color: colors.textSecondary, textAlign: 'center'}]}>
            {"You've viewed all communities"}
          </Text>
        )
      )}
    </View>
  );
});

PaginationLoader.displayName = 'PaginationLoader';

const styles = StyleSheet.create({
  container: {
    paddingVertical: hp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
