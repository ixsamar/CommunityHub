import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../theme';

export const OfflineCard: React.FC = React.memo(() => {
  const {colors, typography} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: colors.warning,
          paddingVertical: hp('1.2%'),
          paddingHorizontal: wp('4%'),
          marginBottom: hp('1.2%'),
        },
      ]}>
      <Icon name="cloud-offline-outline" size={18} color={colors.warning} />
      <Text style={[typography.caption, {color: colors.text, marginLeft: wp('2.5%'), flex: 1}]}>
        You are offline. Showing cached communities.
      </Text>
    </View>
  );
});

OfflineCard.displayName = 'OfflineCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
});
