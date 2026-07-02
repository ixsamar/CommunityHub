import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../../../theme';
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const SplashScreen = () => {
  const { colors, typography } = useTheme();
  const { restoreSession } = useAuth();

  useEffect(() => {
    // Delay session recovery slightly for branding/splash experience
    const timer = setTimeout(() => {
      restoreSession();
    }, 1500);

    return () => clearTimeout(timer);
  }, [restoreSession]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[typography.h1, { color: colors.primary, marginBottom: hp('1%') }]}>
          Community Hub
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: hp('4%') }]}>
          Enterprise Architecture
        </Text>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
