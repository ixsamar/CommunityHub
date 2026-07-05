import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
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
import {registerSchema, RegisterFormValues} from '../../Utils/validation';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {GlassBackground} from '../../Components/common/GlassBackground';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const RegisterScreen = () => {
  const {colors, typography, borderRadius, dark} = useTheme();
  const navigation = useNavigation();
  const {register} = useAuth();
  const {showToast} = useToast();

  const [loading, setLoading] = useState(false);

  const methods = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      const result = await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        showToast('Account created successfully! Welcome!', 'success');
        (navigation as any).navigate('App');
      } else {
        showToast(result.error || 'Registration failed.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'An error occurred during registration.', 'error');
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
          <LoadingOverlay visible={loading} message="Creating account…" />

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
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

                <Text style={[styles.title, {color: colors.text}]}>Create Account</Text>
                <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
                  Join Community Hub today
                </Text>

                <View style={styles.divider} />

                <FormInput
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />

                <FormInput
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <FormPasswordInput
                  name="password"
                  label="Password"
                  placeholder="Create a strong password"
                />

                <FormPasswordInput
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Repeat your password"
                />

                <View style={[styles.hintBox, {
                  backgroundColor: dark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
                  borderRadius: borderRadius.xs,
                }]}>
                  <Icon name="shield-checkmark-outline" size={14} color={colors.primary} />
                  <Text style={[styles.hintText, {color: colors.textSecondary}]}>
                    {'  '}Password must be at least 6 characters
                  </Text>
                </View>

                <Button
                  title="Create Account"
                  variant="primary"
                  onPress={methods.handleSubmit(onSubmit)}
                  style={styles.primaryBtn}
                />

                <View style={styles.footerRow}>
                  <Text style={[styles.footerText, {color: colors.textSecondary}]}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => (navigation as any).navigate('Login')}
                    activeOpacity={0.7}>
                    <Text style={[styles.linkText, {color: colors.primary}]}>  Sign In</Text>
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
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '400',
  },
  primaryBtn: {
    marginTop: hp('2%'),
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
