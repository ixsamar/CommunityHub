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
  ScrollView,
  Dimensions,
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
import {GlassBackground} from '../../Components/common/GlassBackground';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const LoginScreen = () => {
  const {colors, typography, borderRadius, dark} = useTheme();
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
        (navigation as any).navigate('App');
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
        (navigation as any).navigate('App');
      } else {
        showToast(result.error || 'Biometric authentication failed.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'An error occurred during biometric login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cardBg = dark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.96)';
  const cardBorder = dark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)';

  return (
    <GlassBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}>
          <LoadingOverlay visible={loading} message="Signing in…" />

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('App')}
                style={styles.backBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <Icon name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FormProvider {...methods}>
              <View style={[styles.card, {
                backgroundColor: cardBg,
                borderColor: cardBorder,
                borderRadius: borderRadius.lg * 1.6,
              }]}>

                <View style={[styles.logoWrap, {backgroundColor: colors.primary, borderRadius: borderRadius.md}]}>
                  <Text style={[styles.logoLetter, {color: colors.onPrimary}]}>C</Text>
                </View>

                <Text style={[styles.title, {color: colors.text}]}>Welcome Back</Text>
                <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
                  Sign in to Community Hub
                </Text>

                <View style={styles.divider} />

                <FormInput
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  accessibilityHint="Enter your email address"
                />

                <FormPasswordInput
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  accessibilityHint="Enter your account password"
                />

                {biometricsAvailable && (
                  <View style={[styles.switchRow, {borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderWidth: 1, borderRadius: borderRadius.sm, padding: 12, marginTop: 8}]}>
                    <View style={styles.switchLeft}>
                      <Icon name="finger-print-outline" size={18} color={colors.primary} />
                      <Text style={[styles.switchLabel, {color: colors.text}]}>
                        Quick Login with Biometrics
                      </Text>
                    </View>
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
                  style={styles.primaryBtn}
                />

                {biometricsAvailable && biometricsEnrolled && (
                  <TouchableOpacity
                    onPress={handleBiometricLogin}
                    style={[styles.biometricBtn, {borderColor: colors.primary, borderRadius: borderRadius.sm}]}
                    activeOpacity={0.8}>
                    <Icon name="finger-print" size={18} color={colors.primary} style={{marginRight: 6}} />
                    <Text style={[styles.biometricLabel, {color: colors.primary}]}>
                      Sign in with FaceID / TouchID
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.footerRow}>
                  <Text style={[styles.footerText, {color: colors.textSecondary}]}>
                    {"Don't have an account?"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Register')}
                    activeOpacity={0.7}>
                    <Text style={[styles.linkText, {color: colors.primary}]}>  Sign Up</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.brandFooter}>
                  <Text style={[styles.brandText, {color: colors.textSecondary}]}>
                    Powered by mindX360
                  </Text>
                </View>
              </View>
            </FormProvider>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('4%'),
  },
  topRow: {
    height: hp('6%'),
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  backBtn: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  card: {
    padding: wp('6%'),
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
  logoWrap: {
    width: wp('14%'),
    height: wp('14%'),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: hp('1.5%'),
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  logoLetter: {
    fontSize: wp('8%'),
    fontWeight: '900',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: hp('0.5%'),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    marginVertical: hp('2%'),
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  primaryBtn: {
    marginTop: hp('2%'),
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: hp('1.4%'),
    marginTop: hp('1.2%'),
    backgroundColor: 'transparent',
  },
  biometricLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2.5%'),
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  brandFooter: {
    marginTop: hp('2.5%'),
    alignItems: 'center',
    paddingTop: hp('1.5%'),
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.08)',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
});
