import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../../theme';
import {useAppDispatch} from '../../../common/hooks/useAppDispatch';
import {useAppSelector} from '../../../common/hooks/useAppSelector';
import {clearCredentials} from '../../auth/store/authSlice';
import {secureStorage} from '../../../common/storage/mmkv';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ProfileScreen = () => {
  const {colors, typography} = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const handleLogout = () => {
    secureStorage.delete('auth_token');
    dispatch(clearCredentials());
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background, padding: wp('6%')}]}
      edges={['top', 'left', 'right']}>
      <Text style={[typography.h2, {color: colors.text, marginBottom: hp('2%')}]}>
        Your Profile
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: wp('4%'),
            marginBottom: hp('3%'),
          },
        ]}>
        <Text style={[typography.bodyLarge, {color: colors.text, fontWeight: '600'}]}>
          Name: {user?.name || 'Anonymous User'}
        </Text>
        <Text style={[typography.bodyMedium, {color: colors.textSecondary, marginTop: hp('0.5%')}]}>
          Email: {user?.email || 'No email attached'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, {backgroundColor: colors.error, padding: hp('1.8%')}]}
        onPress={handleLogout}
        activeOpacity={0.8}>
        <Text style={[typography.bodyMedium, {color: '#ffffff', fontWeight: '600'}]}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
