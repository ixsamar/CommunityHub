import React, {useEffect} from 'react';
import {StyleSheet, Text, View, Animated, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<{item: ToastMessage; onDismiss: (id: string) => void}> = ({
  item,
  onDismiss,
}) => {
  const {colors, typography} = useTheme();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onDismiss(item.id));
    }, item.duration || 3000);

    return () => clearTimeout(timer);
  }, [item, opacity, onDismiss]);

  const getBorderLeftColor = () => {
    switch (item.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
      default:
        return colors.primary;
    }
  };
  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          opacity,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: getBorderLeftColor(),
          borderLeftWidth: 6,

          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
          marginBottom: hp('10%'),
        },
      ]}>
      <View style={styles.contentContainer}>
        <Text style={[typography.bodySmall, {color: colors.text, flex: 1, fontWeight: '500'}]}>
          {item.message}
        </Text>
        {item.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              item.action?.onPress();
              onDismiss(item.id);
            }}>
            <Text
              style={[
                typography.caption,
                {color: colors.primary, fontWeight: '700', textTransform: 'uppercase'},
              ]}>
              {item.action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({toasts, onDismiss}) => {
  return (
    <>
      {toasts.length > 0 && (
        <View style={styles.bottomContainer} pointerEvents="box-none">
          {toasts.map(toast => (
            <ToastItem key={toast.id} item={toast} onDismiss={onDismiss} />
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    width: wp('90%'),
    padding: hp('2%'),
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: hp('0.5%'),
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: wp('4%'),
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
  },
});
