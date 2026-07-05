import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {useAuth} from './hooks/useAuth';
import {useTheme} from '../../Utils/themeIndex';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const SplashScreen = () => {
  const {colors, typography, borderRadius} = useTheme();
  const {restoreSession} = useAuth();


  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const glowScale = useSharedValue(0.9);

  useEffect(() => {

    logoScale.value = withSpring(1.0, {damping: 10, stiffness: 80});
    logoOpacity.value = withTiming(1, {duration: 600});

    const textTimer = setTimeout(() => {
      textOpacity.value = withTiming(1, {duration: 700});
      subtitleTranslateY.value = withSpring(0, {damping: 12, stiffness: 90});
    }, 300);


    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.9, {duration: 1200, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );


    const sessionTimer = setTimeout(() => {
      restoreSession();
    }, 2200);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(sessionTimer);
    };
  }, [restoreSession]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{scale: logoScale.value}],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{translateY: subtitleTranslateY.value}],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{scale: glowScale.value}],
  }));

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {}
      <Animated.View
        style={[
          styles.glowBlob,
          {
            backgroundColor: colors.primaryLight,
            borderRadius: wp('35%'),
          },
          animatedGlowStyle,
        ]}
      />

      <View style={styles.content}>
        {}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.lg * 1.5,
              shadowColor: colors.primary,
            },
            animatedLogoStyle,
          ]}>
          <Text style={[styles.iconText, {color: colors.onPrimary}]}>C</Text>
        </Animated.View>

        {}
        <Animated.View style={animatedTextStyle}>
          <Text style={[typography.h1, {color: colors.text, marginTop: hp('3%'), textAlign: 'center'}]}>
            Community Hub
          </Text>
        </Animated.View>

        {}
        <Animated.View style={animatedSubtitleStyle}>
          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.textSecondary,
                marginTop: hp('1%'),
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                fontWeight: '600',
              },
            ]}>
            Enterprise Architecture
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    width: wp('70%'),
    height: wp('70%'),
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    width: wp('22%'),
    height: wp('22%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconText: {
    fontSize: wp('12%'),
    fontWeight: '900',
    fontStyle: 'italic',
  },
});
