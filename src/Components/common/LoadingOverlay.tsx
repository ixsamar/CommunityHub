import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Skeleton} from './Skeleton';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Please wait...',
}) => {
  const {colors, typography} = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[styles.overlayContainer, {backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}>
      <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Skeleton width={48} height={48} borderRadius={24} style={{alignSelf: 'center', marginBottom: hp('1.5%')}} />
        <Text
          style={[
            typography.bodySmall,
            {color: colors.text, marginTop: hp('1.5%'), fontWeight: '600'},
          ]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  card: {
    padding: wp('6%'),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp('40%'),

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
});
