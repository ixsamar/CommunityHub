/**
 * Skeleton — Animated shimmer placeholder for loading states.
 *
 * Uses Reanimated 3 for smooth, battery-friendly shimmer.
 * Automatically uses theme skeleton tokens for light/dark mode.
 *
 * Accessibility:
 *   - accessibilityElementsHidden: true  (decorative — screen reader skips)
 *   - importantForAccessibility: "no-hide-descendants" (Android)
 */

import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  useSharedValue,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import {useColors} from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
  testID,
}) => {
  const colors = useColors();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 800, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.5, {duration: 800, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
    return () => {
      // cancelAnimation handled by unmount cleanup
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        // eslint-disable-next-line react-native/no-inline-styles
        {width: width as number, height: height as number, borderRadius},
        {backgroundColor: colors.skeleton},
        style,
      ]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {borderRadius, backgroundColor: colors.skeletonHighlight},
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
