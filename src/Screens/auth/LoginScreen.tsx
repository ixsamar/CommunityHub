import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';
import {FormInput} from '../../Components/common/FormInput';
import {FormPasswordInput} from '../../Components/common/FormPasswordInput';
import {Button} from '../../Components/common/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import {LoadingOverlay} from '../../Components/common/LoadingOverlay';
import {useToast} from '../../Components/common/ToastContext';
import {useAuth} from './hooks/useAuth';
import {loginSchema, LoginFormValues} from '../../Utils/validation';
import {BiometricsService} from '../../APIServices/biometricsService';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

export const LoginScreen = () => {
  const {colors, typography} = useTheme();
  const navigation = useNavigation();
  const {login, biometricLogin, toggleBiometricEnrollment} = useAuth();
  const {showToast} = useToast();

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
    try {
      setLoading(true);
      const result = await login({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        showToast('Logged in successfully', 'success');

        if (biometricsAvailable) {
          await toggleBiometricEnrollment(enableBiometricsOptIn, {
            email: data.email,
            password: data.password,
          });
        }
        navigation.goBack();
      } else {
        if (result.error === 'User not found. Please register first.') {
          Alert.alert(
            'Account Not Found',
            'No account matches this email address. Would you like to register a new account?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Register',
                onPress: () => {
                  (navigation as any).navigate('Register');
                },
              },
            ],
            {cancelable: true},
          );
        } else {
          showToast(result.error || 'Login failed. Please check your credentials.', 'error');
        }
      }
    } catch (e: any) {
      showToast(e.message || 'An error occurred during login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      const result = await biometricLogin();

      if (result.success) {
        showToast('Authenticated with biometrics', 'success');
        navigation.goBack();
      } else {
        showToast(result.error || 'Biometric authentication failed.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'An error occurred during biometric login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: colors.background}}
      edges={['top', 'bottom', 'left', 'right']}>
      {/* Header Row with Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <LoadingOverlay visible={loading} message="Authenticating..." />

        <FormProvider {...methods}>
          <View style={[styles.innerContainer, {paddingHorizontal: wp('8%')}]}>
            <View style={styles.header}>
              <Text style={[typography.h1, {color: colors.text, marginBottom: hp('1%')}]}>
                Community Hub
              </Text>
              <Text
                style={[
                  typography.bodyMedium,
                  {color: colors.textSecondary, marginBottom: hp('4%')},
                ]}>
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
                <Text style={[typography.bodySmall, {color: colors.text}]}>
                  Enable FaceID / TouchID for quick login
                </Text>
                <Switch
                  value={enableBiometricsOptIn}
                  onValueChange={setEnableBiometricsOptIn}
                  trackColor={{false: colors.border, true: colors.primary}}
                  thumbColor="#ffffff"
                />
              </View>
            )}

            <Button
              title="Log In"
              variant="primary"
              onPress={methods.handleSubmit(onSubmit)}
              style={{marginTop: hp('2%')}}
            />

            {biometricsAvailable && biometricsEnrolled && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricButton, {borderColor: colors.primary, borderWidth: 1}]}
                activeOpacity={0.8}>
                <Text style={[typography.bodySmall, {color: colors.primary, fontWeight: '700'}]}>
                  SIGN IN WITH FACEID / TOUCHID
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => (navigation as any).navigate('Register')}
              style={styles.registerLink}
              activeOpacity={0.7}>
              <Text style={[typography.bodySmall, {color: colors.primary, fontWeight: '600'}]}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
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
  headerRow: {
    height: hp('6%'),
    justifyContent: 'center',
    paddingHorizontal: wp('4%'),
  },
  backBtn: {
    padding: 6,
    alignSelf: 'flex-start',
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
  registerLink: {
    marginTop: hp('2.5%'),
    alignItems: 'center',
    padding: hp('1%'),
  },
});
