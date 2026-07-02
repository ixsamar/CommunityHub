import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../theme';

interface Props {
  message?: string;
  onRetry: () => void;
}

export const RetryCard: React.FC<Props> = React.memo(({
  message = 'Failed to load communities. Please check your connection.',
  onRetry,
}) => {
  const {colors, typography} = useTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Icon name="alert-circle-outline" size={48} color={colors.error} />
      <Text
        style={[
          typography.h3,
          {color: colors.text, marginTop: hp('2%'), marginBottom: hp('1%')},
        ]}>
        Oops! Something went wrong
      </Text>
      <Text
        style={[
          typography.bodyMedium,
          {color: colors.textSecondary, textAlign: 'center', marginHorizontal: wp('8%'), marginBottom: hp('3%')},
        ]}>
        {message}
      </Text>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: colors.primary}]}
        onPress={onRetry}
        activeOpacity={0.8}>
        <Icon name="refresh" size={18} color="#ffffff" style={styles.buttonIcon} />
        <Text style={[typography.bodyMedium, {color: '#ffffff', fontWeight: '700'}]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
});

RetryCard.displayName = 'RetryCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp('6%'),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: wp('1.5%'),
  },
});
