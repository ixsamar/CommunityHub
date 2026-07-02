/**
 * CommunityHub Animation System
 *
 * Centralized Reanimated 3 presets:
 * - timing/spring configs
 * - useEnterAnimation  — fade + slide in on mount
 * - useFadeIn          — opacity only
 * - useSlideUp         — translate Y on mount
 * - usePressAnimation  — scale micro-interaction for touchables
 * - useShimmer         — repeating shimmer for skeleton loaders
 *
 * All animations respect the reduce-motion accessibility setting.
 */

import {useEffect} from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import {AccessibilityInfo} from 'react-native';

// ----------------------------------------------------------------------------
// Timing / Spring presets
// ----------------------------------------------------------------------------
export const timingConfig = {
  fast: {duration: 150, easing: Easing.out(Easing.ease)},
  medium: {duration: 280, easing: Easing.out(Easing.exp)},
  slow: {duration: 450, easing: Easing.inOut(Easing.ease)},
  ultraSlow: {duration: 700, easing: Easing.inOut(Easing.ease)},
} as const;

export const springConfig = {
  responsive: {damping: 20, stiffness: 300, mass: 0.8},
  bouncy: {damping: 12, stiffness: 260, mass: 0.9},
  gentle: {damping: 28, stiffness: 180, mass: 1.0},
} as const;

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
let _reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled().then((v) => {
  _reduceMotion = v;
});
AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
  _reduceMotion = v;
});

const skipIfReduceMotion = (value: number) =>
  _reduceMotion ? value : value;

// ----------------------------------------------------------------------------
// useFadeIn — entry opacity animation
// ----------------------------------------------------------------------------
export const useFadeIn = (delay: number = 0) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (_reduceMotion) {
      opacity.value = 1;
      return;
    }
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, timingConfig.medium);
    }, delay);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return {animatedStyle};
};

// ----------------------------------------------------------------------------
// useSlideUp — entry translate + fade animation
// ----------------------------------------------------------------------------
export const useSlideUp = (offset: number = 24, delay: number = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(_reduceMotion ? 0 : offset);

  useEffect(() => {
    if (_reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, timingConfig.medium);
      translateY.value = withSpring(0, springConfig.responsive);
    }, delay);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return {animatedStyle};
};

// ----------------------------------------------------------------------------
// useEnterAnimation — combined fade + slide, staggered by index
// ----------------------------------------------------------------------------
export const useEnterAnimation = (index: number = 0) => {
  const stagger = Math.min(index * 50, 300);
  return useSlideUp(20, stagger);
};

// ----------------------------------------------------------------------------
// usePressAnimation — scale down on press, spring back on release
// Perfect for cards and buttons
// ----------------------------------------------------------------------------
export const usePressAnimation = (scaleTarget: number = 0.97) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    if (_reduceMotion) return;
    scale.value = withSpring(scaleTarget, springConfig.responsive);
  };

  const onPressOut = () => {
    if (_reduceMotion) return;
    scale.value = withSpring(1, springConfig.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return {onPressIn, onPressOut, animatedStyle};
};

// ----------------------------------------------------------------------------
// useShimmer — shimmer effect for Skeleton loading components
// ----------------------------------------------------------------------------
export const useShimmer = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (_reduceMotion) {
      progress.value = 0.5; // Static mid-state if motion disabled
      return;
    }
    progress.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1, // infinite
      false,
    );
    return () => {
      cancelAnimation(progress);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.4, 1]),
  }));

  return {shimmerStyle, progress};
};

// ----------------------------------------------------------------------------
// useRotate — rotating loader / refresh indicator
// ----------------------------------------------------------------------------
export const useRotateAnimation = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {duration: 800, easing: Easing.linear}),
      -1,
      false,
    );
    return () => {
      cancelAnimation(rotation);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  return {animatedStyle};
};

// Export a no-op for reduce motion compatibility
export {skipIfReduceMotion};
