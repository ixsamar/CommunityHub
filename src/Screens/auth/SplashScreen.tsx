import React, {useEffect} from 'react';
import {StyleSheet, Text, View, Platform} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, {Path, Circle} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {authService} from '../../APIServices/auth/authService';

let Sound: any = null;
try {
  Sound = require('react-native-sound');
  if (Sound && Sound.setCategory) {
    Sound.setCategory('Playback');
  }
} catch {}

export const SplashScreen = () => {
  const blobOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const orbitRotation = useSharedValue(0);
  const networkOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    blobOpacity.value = withTiming(1, {duration: 700});

    const iconTimer = setTimeout(() => {
      iconScale.value = withSpring(1.0, {damping: 12, stiffness: 70});
    }, 600);

    const ringTimer = setTimeout(() => {
      ringScale.value = withTiming(1.0, {duration: 1000, easing: Easing.out(Easing.ease)});
      ringOpacity.value = withSequence(
        withTiming(1, {duration: 200}),
        withTiming(0, {duration: 800}),
      );
    }, 1000);

    const orbitTimer = setTimeout(() => {
      orbitRotation.value = withRepeat(
        withTiming(360, {duration: 4000, easing: Easing.linear}),
        -1,
        false,
      );
    }, 1200);

    const networkTimer = setTimeout(() => {
      networkOpacity.value = withTiming(1, {duration: 800});
    }, 1400);

    const textTimer = setTimeout(() => {
      textOpacity.value = withTiming(1, {duration: 600});

      dot1Y.value = withRepeat(
        withSequence(
          withTiming(-6, {duration: 300, easing: Easing.inOut(Easing.ease)}),
          withTiming(0, {duration: 300, easing: Easing.inOut(Easing.ease)}),
        ),
        -1,
        true,
      );

      setTimeout(() => {
        dot2Y.value = withRepeat(
          withSequence(
            withTiming(-6, {duration: 300, easing: Easing.inOut(Easing.ease)}),
            withTiming(0, {duration: 300, easing: Easing.inOut(Easing.ease)}),
          ),
          -1,
          true,
        );
      }, 150);

      setTimeout(() => {
        dot3Y.value = withRepeat(
          withSequence(
            withTiming(-6, {duration: 300, easing: Easing.inOut(Easing.ease)}),
            withTiming(0, {duration: 300, easing: Easing.inOut(Easing.ease)}),
          ),
          -1,
          true,
        );
      }, 300);
    }, 2000);

    let chime: any = null;
    if (Sound) {
      chime = new Sound(
        'https://www.soundjay.com/buttons/sounds/button-10.mp3',
        undefined,
        (error: any) => {
          if (!error && chime) {
            chime.play();
          }
        },
      );
    }

    const sessionTimer = setTimeout(() => {
      authService.restoreSession();
    }, 3800);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(ringTimer);
      clearTimeout(orbitTimer);
      clearTimeout(networkTimer);
      clearTimeout(textTimer);
      clearTimeout(sessionTimer);
      if (chime) {
        try {
          chime.release();
        } catch {}
      }
    };
  }, []);

  const animatedBlobStyle = useAnimatedStyle(() => ({
    opacity: blobOpacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{scale: iconScale.value}],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{scale: ringScale.value}],
  }));

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${orbitRotation.value}deg`}],
  }));

  const animatedNetworkStyle = useAnimatedStyle(() => ({
    opacity: networkOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{translateY: dot1Y.value}],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{translateY: dot2Y.value}],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{translateY: dot3Y.value}],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedBlobStyle]}>
        <View
          style={[
            styles.blob,
            {
              width: wp('90%'),
              height: wp('90%'),
              borderRadius: wp('45%'),
              backgroundColor: 'rgba(186, 230, 253, 0.4)',
              top: -hp('12%'),
              left: -wp('20%'),
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              width: wp('85%'),
              height: wp('85%'),
              borderRadius: wp('42.5%'),
              backgroundColor: 'rgba(233, 213, 255, 0.45)',
              bottom: -hp('15%'),
              right: -wp('25%'),
            },
          ]}
        />
        <View
          style={[
            styles.blob,
            {
              width: wp('70%'),
              height: wp('70%'),
              borderRadius: wp('35%'),
              backgroundColor: 'rgba(254, 215, 170, 0.35)',
              top: hp('32%'),
              left: wp('50%'),
            },
          ]}
        />
      </Animated.View>

      <View style={styles.animationViewport}>
        <Animated.View
          style={[
            styles.expandingRing,
            {borderColor: 'rgba(59, 130, 246, 0.2)'},
            animatedRingStyle,
          ]}
        />

        <Animated.View style={[styles.networkContainer, animatedNetworkStyle]}>
          <View style={styles.dottedRing} />

          <View style={[styles.avatarNode, {top: 0, left: '50%', marginLeft: -14, backgroundColor: '#8B5CF6'}]}>
            <Icon name="person" size={10} color="#FFFFFF" />
          </View>
          <View style={[styles.avatarNode, {top: '30%', left: 0, marginTop: -14, backgroundColor: '#3B82F6'}]}>
            <Icon name="person" size={10} color="#FFFFFF" />
          </View>
          <View style={[styles.avatarNode, {top: '30%', right: 0, marginTop: -14, backgroundColor: '#EC4899'}]}>
            <Icon name="person" size={10} color="#FFFFFF" />
          </View>
          <View style={[styles.avatarNode, {bottom: '8%', left: '16%', backgroundColor: '#10B981'}]}>
            <Icon name="person" size={10} color="#FFFFFF" />
          </View>
          <View style={[styles.avatarNode, {bottom: '8%', right: '16%', backgroundColor: '#F59E0B'}]}>
            <Icon name="person" size={10} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.orbitWrapper, animatedOrbitStyle]}>
          <View style={[styles.orbitDot, {top: 25, left: '50%', backgroundColor: '#EC4899', width: 6, height: 6, borderRadius: 3}]} />
          <View style={[styles.orbitDot, {bottom: 35, left: '20%', backgroundColor: '#3B82F6', width: 7, height: 7, borderRadius: 3.5}]} />
          <View style={[styles.orbitDot, {top: '60%', right: 10, backgroundColor: '#8B5CF6', width: 5, height: 5, borderRadius: 2.5}]} />
          <View style={[styles.orbitDot, {top: '15%', right: 40, backgroundColor: '#F59E0B', width: 6, height: 6, borderRadius: 3}]} />
        </Animated.View>

        <Animated.View style={[styles.logoIconContainer, animatedIconStyle]}>
          <Svg width={wp('26%')} height={wp('26%')} viewBox="0 0 120 120">
            <Circle cx="20" cy="52" r="8" fill="#FFB020" />
            <Circle cx="100" cy="52" r="8" fill="#FFB020" />

            <Path
              d="M 60 112 C 28 80 25 60 25 42 C 25 20 40 6 60 6 C 80 6 95 20 95 42 C 95 60 92 80 60 112 Z"
              fill="#FFFFFF"
            />
            
            <Circle cx="60" cy="42" r="23" fill="#2E5BFF" />
            
            <Circle cx="51" cy="36" r="3" fill="#FFFFFF" />
            <Circle cx="69" cy="36" r="3" fill="#FFFFFF" />
            <Circle cx="51.5" cy="36.5" r="1.2" fill="#000000" />
            <Circle cx="68.5" cy="36.5" r="1.2" fill="#000000" />
            
            <Path
              d="M 49 48 C 49 48 54 57 60 57 C 66 57 71 48 71 48"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View style={[styles.brandContainer, animatedTextStyle]}>
        <Text style={styles.brandText}>Community Hub</Text>
        <Text style={styles.poweredByText}>Powered by mindX360</Text>
        <Text style={styles.sloganText}>Modernize  •  Integrate  •  Transform</Text>

        <View style={styles.loadingDotsRow}>
          <Animated.View style={[styles.loadingDot, dot1Style]} />
          <Animated.View style={[styles.loadingDot, dot2Style]} />
          <Animated.View style={[styles.loadingDot, dot3Style]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
  animationViewport: {
    width: wp('65%'),
    height: wp('65%'),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  expandingRing: {
    position: 'absolute',
    width: wp('42%'),
    height: wp('42%'),
    borderRadius: wp('21%'),
    borderWidth: 2,
  },
  networkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedRing: {
    position: 'absolute',
    width: wp('52%'),
    height: wp('52%'),
    borderRadius: wp('26%'),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  avatarNode: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orbitWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  orbitDot: {
    position: 'absolute',
  },
  logoIconContainer: {
    width: wp('26%'),
    height: wp('26%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 100,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: hp('4%'),
  },
  brandText: {
    fontSize: wp('7.5%'),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  poweredByText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#0284C7',
    marginTop: hp('0.3%'),
    letterSpacing: 0.5,
  },
  sloganText: {
    fontSize: wp('2.8%'),
    fontWeight: '500',
    color: '#64748B',
    marginTop: hp('0.3%'),
    letterSpacing: 0.5,
  },
  loadingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2.5%'),
    height: 12,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginHorizontal: 4,
    opacity: 0.75,
  },
});
