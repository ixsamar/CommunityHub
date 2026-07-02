import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../theme';

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({title, description, actionLabel, onAction}) => {
  const {colors, typography, borderRadius} = useTheme();

  return (
    <View 
      style={[styles.container, {padding: wp('6%')}]}
      accessible={true}
      accessibilityLabel={`${title}. ${description}`}
    >
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={1.3}
        style={[typography.h3, {color: colors.text, marginBottom: hp('1%'), textAlign: 'center'}]}>
        {title}
      </Text>
      <Text
        maxFontSizeMultiplier={1.4}
        style={[
          typography.bodyMedium,
          {color: colors.textSecondary, marginBottom: hp('3%'), textAlign: 'center'},
        ]}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              paddingHorizontal: wp('6%'),
              paddingVertical: hp('1.5%'),
              borderRadius: borderRadius.md,
            },
          ]}
          onPress={onAction}
          activeOpacity={0.8}>
          <Text 
            maxFontSizeMultiplier={1.3}
            style={[typography.bodyMedium, {color: colors.onPrimary, fontWeight: '600'}]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
