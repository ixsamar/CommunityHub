import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';

interface Props {
  message?: string;
  onRetry: () => void;
}

export const RetryUI: React.FC<Props> = ({message = 'Failed to load data', onRetry}) => {
  const {colors, typography} = useTheme();

  return (
    <View style={[styles.container, {padding: wp('6%')}]}>
      <Text
        style={[
          typography.bodyMedium,
          {color: colors.textSecondary, marginBottom: hp('2%'), textAlign: 'center'},
        ]}>
        {message}
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            paddingHorizontal: wp('6%'),
            paddingVertical: hp('1.5%'),
          },
        ]}
        onPress={onRetry}
        activeOpacity={0.8}>
        <Text style={[typography.bodyMedium, {color: '#ffffff', fontWeight: '600'}]}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
