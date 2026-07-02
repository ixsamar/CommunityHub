import React, {useState} from 'react';
import {StyleSheet, View, ImageProps, ImageStyle, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {Skeleton} from './Skeleton';
import {useColors} from '../../Utils/themeIndex';
import Icon from 'react-native-vector-icons/Ionicons';

interface LazyImageProps extends Omit<ImageProps, 'style'> {
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle;
  placeholderIcon?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  source,
  style,
  containerStyle,
  placeholderIcon = 'image-outline',
  ...props
}) => {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const opacity = useSharedValue(0);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleLoad = () => {
    setLoading(false);
    opacity.value = withTiming(1, {duration: 300});
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const flatStyle = StyleSheet.flatten(style) || {};
  const width = flatStyle.width || '100%';
  const height = flatStyle.height || '100%';
  const borderRadius = flatStyle.borderRadius || 0;

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        {width: width as any, height: height as any, borderRadius: borderRadius as number},
      ]}>
      {loading && (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={borderRadius as number}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {error ? (
        <View
          style={[
            styles.errorContainer,
            {backgroundColor: colors.surfaceVariant, borderRadius: borderRadius as number},
          ]}>
          <Icon name={placeholderIcon} size={24} color={colors.textSecondary} />
        </View>
      ) : (
        <Animated.Image
          {...props}
          source={source}
          style={[style, imageStyle]}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
