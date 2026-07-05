import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GlassBackground: React.FC<Props> = ({children, style}) => {
  const theme = useTheme();
  const {dark, colors} = theme;

  return (
    <View style={[styles.container, {backgroundColor: colors.background}, style]}>
      {/* Mesh Aurora Blobs */}
      <View
        style={[
          styles.blob,
          {
            width: wp('90%'),
            height: wp('90%'),
            borderRadius: wp('45%'),
            backgroundColor: dark ? 'rgba(0, 186, 242, 0.12)' : 'rgba(0, 186, 242, 0.15)',
            top: -hp('15%'),
            left: -wp('25%'),
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: wp('100%'),
            height: wp('100%'),
            borderRadius: wp('50%'),
            backgroundColor: dark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.12)',
            bottom: -hp('15%'),
            right: -wp('30%'),
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
            backgroundColor: dark ? 'rgba(236, 72, 153, 0.05)' : 'rgba(236, 72, 153, 0.08)',
            top: hp('30%'),
            left: wp('15%'),
          },
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
});
