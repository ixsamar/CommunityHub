import React, {useCallback} from 'react';
import {
  Text,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  GestureResponderEvent,
} from 'react-native';
import {Skeleton} from './Skeleton';
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityHint?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  testID,
  ...props
}) => {
  const {colors, typography, borderRadius: br} = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, {damping: 20, stiffness: 300});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15, stiffness: 260});
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const isDisabled = disabled || loading;

  const containerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      paddingVertical: hp('1.8%'),
      paddingHorizontal: wp('6%'),
      borderRadius: br.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      opacity: isDisabled ? 0.55 : 1,
    };

    if (isDisabled) {
      return {...base, backgroundColor: colors.surfaceVariant};
    }

    switch (variant) {
      case 'secondary':
        return {
          ...base,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        };
      case 'danger':
        return {...base, backgroundColor: colors.error};
      case 'primary':
      default:
        return {...base, backgroundColor: colors.primary};
    }
  };

  const labelColor = (): string => {
    if (isDisabled) return colors.textDisabled;
    switch (variant) {
      case 'secondary':
        return colors.text;
      case 'ghost':
        return colors.primary;
      case 'danger':
      case 'primary':
      default:
        return colors.onPrimary;
    }
  };

  const spinnerColor =
    variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{disabled: isDisabled, busy: loading}}
        style={[containerStyle(), style]}
        testID={testID}

        onStartShouldSetResponder={() => !isDisabled}
        onResponderGrant={handlePressIn}
        onResponderRelease={(e: GestureResponderEvent) => {
          handlePressOut();
          if (!isDisabled && onPress) {
            onPress(e);
          }
        }}
        onResponderTerminate={handlePressOut}
        {...props}>
        {loading ? (
          <Skeleton width={50} height={12} borderRadius={3} style={{backgroundColor: spinnerColor + '40'}} />
        ) : (
          <Text
            style={[typography.button, {color: labelColor(), letterSpacing: 0.2}, textStyle]}
            allowFontScaling
            maxFontSizeMultiplier={1.3}>
            {title}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
};
