import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '../../../theme';
import { FormInput } from '../../../common/components/FormInput';
import { FormPasswordInput } from '../../../common/components/FormPasswordInput';
import { Button } from '../../../common/components/Button';
import { LoadingOverlay } from '../../../common/components/LoadingOverlay';
import { useToast } from '../../../common/components/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, LoginFormValues } from '../../../common/utils/validation';
import { BiometricsService } from '../../../common/services/biometricsService';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginScreen = () => {
  const { colors, typography } = useTheme();
  const { login, biometricLogin, toggleBiometricEnrollment } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnrolled, setBiometricsEnrolled] = useState(false);
  const [enableBiometricsOptIn, setEnableBiometricsOptIn] = useState(false);

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check biometric enrollment status on load
  useEffect(() => {
    const checkBiometrics = async () => {
      const available = await BiometricsService.isBiometricsAvailable();
      setBiometricsAvailable(available);
      if (available) {
        const enrolled = BiometricsService.isEnrolled();
        setBiometricsEnrolled(enrolled);
        setEnableBiometricsOptIn(enrolled);
      }
    };
    checkBiometrics();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    const result = await login({
      email: data.email,
      password: data.password,
    });
    setLoading(false);

    if (result.success) {
      showToast('Logged in successfully', 'success');
      // Update enrollment based on the toggle value
      if (biometricsAvailable) {
        await toggleBiometricEnrollment(enableBiometricsOptIn, {
          email: data.email,
          password: data.password,
        });
      }
    } else {
      showToast(result.error || 'Login failed. Please check your credentials.', 'error');
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    const result = await biometricLogin();
    setLoading(false);

    if (result.success) {
      showToast('Authenticated with biometrics', 'success');
    } else {
      showToast(result.error || 'Biometric authentication failed.', 'error');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <LoadingOverlay visible={loading} message="Authenticating..." />
        
        <FormProvider {...methods}>
          <View style={[styles.innerContainer, { paddingHorizontal: wp('8%') }]}>
            <View style={styles.header}>
              <Text style={[typography.h1, { color: colors.text, marginBottom: hp('1%') }]}>
                Community Hub
              </Text>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: hp('4%') }]}>
                Sign in to join the discussion
              </Text>
            </View>

            <FormInput
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              accessibilityHint="Enter your corporate or personal email address."
            />

            <FormPasswordInput
              name="password"
              label="Password"
              placeholder="Enter your password"
              accessibilityHint="Enter your account password."
            />

            {biometricsAvailable && (
              <View style={styles.switchRow}>
                <Text style={[typography.bodySmall, { color: colors.text }]}>
                  Enable FaceID / TouchID for quick login
                </Text>
                <Switch
                  value={enableBiometricsOptIn}
                  onValueChange={setEnableBiometricsOptIn}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#ffffff"
                />
              </View>
            )}

            <Button
              title="Log In"
              variant="primary"
              onPress={methods.handleSubmit(onSubmit)}
              style={{ marginTop: hp('2%') }}
            />

            {biometricsAvailable && biometricsEnrolled && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricButton, { borderColor: colors.primary, borderWidth: 1 }]}
                activeOpacity={0.8}>
                <Text style={[typography.bodySmall, { color: colors.primary, fontWeight: '700' }]}>
                  SIGN IN WITH FACEID / TOUCHID
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </FormProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: hp('1%'),
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('90%'),
    alignSelf: 'center',
    marginVertical: hp('1.5%'),
  },
  biometricButton: {
    marginTop: hp('2%'),
    padding: hp('1.8%'),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('90%'),
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
