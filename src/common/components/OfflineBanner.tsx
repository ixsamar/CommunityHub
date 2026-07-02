import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../theme';

interface Props {
  isOffline: boolean;
}

export const OfflineBanner: React.FC<Props> = ({isOffline}) => {
  const {colors, typography} = useTheme();
  const insets = useSafeAreaInsets();
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(isOffline ? hp('5%') + insets.top : 0, {duration: 300});
  }, [isOffline, insets.top, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: height.value > 0 ? 1 : 0,
  }));

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        styles.banner,
        {
          backgroundColor: colors.error,
          paddingTop: insets.top,
        },
        animatedStyle,
      ]}>
      <Text
        maxFontSizeMultiplier={1.3}
        style={[
          typography.caption,
          {color: colors.onError, fontWeight: '600', paddingVertical: hp('0.5%')},
        ]}>
        No Internet Connection. Working Offline.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: wp('100%'),
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
