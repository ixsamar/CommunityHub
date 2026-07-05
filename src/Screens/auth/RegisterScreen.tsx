import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
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
        showToast('Registered and logged in successfully', 'success');
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

  return (
    <GlassBackground>
      <SafeAreaView
        style={{flex: 1, backgroundColor: 'transparent'}}
        edges={['top', 'bottom', 'left', 'right']}>
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
          <LoadingOverlay visible={loading} message="Registering Account..." />

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <FormProvider {...methods}>
              <View style={[styles.innerContainer, {paddingHorizontal: wp('6%')}]}>
                <View
                  style={[
                    styles.authCard,
                    {
                      backgroundColor: dark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.75)',
                      borderColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)',
                      borderRadius: borderRadius.lg * 1.5,
                    },
                  ]}>
                  <View
                    style={[
                      styles.logoBadge,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: borderRadius.md,
                      },
                    ]}>
                    <Text style={[styles.logoText, {color: colors.onPrimary}]}>C</Text>
                  </View>

                  <View style={styles.header}>
                    <Text style={[typography.h1, {color: colors.text, marginBottom: hp('0.5%')}]}>
                      Create Account
                    </Text>
                    <Text style={[typography.bodyMedium, {color: colors.textSecondary, marginBottom: hp('3%')}]}>
                      Join Community Hub today
                    </Text>
                  </View>

                  <FormInput
                    name="name"
                    label="Full Name"
                    placeholder="Enter your name"
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
                    placeholder="Create a password"
                  />

                  <FormPasswordInput
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                  />

                  <Button
                    title="Register"
                    variant="primary"
                    onPress={methods.handleSubmit(onSubmit)}
                    style={{marginTop: hp('2%')}}
                  />

                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.loginLink}
                    activeOpacity={0.7}>
                    <Text style={[typography.bodySmall, {color: colors.primary, fontWeight: '700'}]}>
                      Already have an account? Sign In
                    </Text>
                  </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: hp('4%'),
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
    justifyContent: 'center',
    paddingVertical: hp('2%'),
  },
  authCard: {
    padding: wp('6%'),
    borderWidth: 1.5,
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoBadge: {
    width: wp('12%'),
    height: wp('12%'),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: hp('1.5%'),
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  logoText: {
    fontSize: wp('7%'),
    fontWeight: '900',
    fontStyle: 'italic',
  },
  header: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: hp('1%'),
  },
  loginLink: {
    marginTop: hp('2%'),
    alignItems: 'center',
    padding: hp('1%'),
  },
});
