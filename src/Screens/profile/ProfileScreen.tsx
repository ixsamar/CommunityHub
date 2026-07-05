import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, Image} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../Utils/themeIndex';
import {useAppDispatch} from '../../Utils/hooks/useAppDispatch';
import {useAppSelector} from '../../Utils/hooks/useAppSelector';
import {clearCredentials} from '../../Store/slices/authSlice';
import {setThemeMode, ThemeMode} from '../../Store/slices/themeSlice';
import {secureStorage} from '../../Utils/mmkv';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList, RootStackParamList} from '../../Constance/globalTypes';
import {Skeleton} from '../../Components/common/Skeleton';
import {GlassBackground} from '../../Components/common/GlassBackground';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const ProfileScreen = () => {
  const theme = useTheme();
  const {colors, typography, borderRadius, dark} = theme;
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();

  const user = useAppSelector(state => state.auth.user);
  const currentThemeMode = useAppSelector(state => state.theme?.mode ?? 'system');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const displayName = user ? user.name : 'Guest User';
  const displayEmail = user ? user.email : 'Please sign in to access your profile';



  const handleLogout = () => {
    secureStorage.delete('auth_token');
    dispatch(clearCredentials());
  };

  if (isLoading) {
    return (
      <GlassBackground>
        <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['top', 'left', 'right']}>
          {}
          <View style={[styles.headerRow, {borderBottomColor: colors.border}]}>
            <Text style={[typography.h3, {color: colors.text, fontWeight: '800'}]}>Profile</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {}
            <View
              style={[
                styles.skeletonProfileCard,
                {
                  backgroundColor: dark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.55)',
                  borderColor: colors.border,
                  borderRadius: borderRadius.lg,
                },
              ]}>
              <Skeleton width={wp('16%')} height={wp('16%')} borderRadius={wp('8%')} />
              <View style={{marginLeft: wp('4%'), flex: 1}}>
                <Skeleton width="60%" height={16} borderRadius={3} style={{marginBottom: 8}} />
                <Skeleton width="40%" height={12} borderRadius={3} />
              </View>
            </View>

            {}
            {[1, 2, 3, 4].map(key => (
              <View key={key} style={[styles.skeletonItem, {borderColor: colors.border}]}>
                <Skeleton width="80%" height={14} borderRadius={3} />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <SafeAreaView
        style={[styles.container, {backgroundColor: 'transparent'}]}
        edges={['top', 'left', 'right']}>
      {}
      <View style={[styles.headerRow, {borderBottomColor: colors.border}]}>
        <Text style={[typography.h3, {color: colors.text, fontWeight: '800'}]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {}
        {user ? (
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
            ]}>
            <Image
              source={{uri: 'https://imgs.search.brave.com/3VCGXoShR6x43wbssYRqbucgx9gXPtweefhtFvwHUpU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/aWNvbnM4LmNvbS9u/b2xhbi8xMjAwL2dl/bmRlci1uZXV0cmFs/LXVzZXIuanBn'}}
              style={styles.largeAvatar}
            />
            <View style={styles.profileMeta}>
              <Text style={[typography.h3, {color: colors.text, fontWeight: '700'}]}>
                {displayName}
              </Text>
              <Text
                style={[typography.bodySmall, {color: colors.textSecondary, marginTop: hp('0.3%')}]}>
                {displayEmail}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.moreButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="More actions">
              <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
            ]}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            activeOpacity={0.8}>
            <View style={[styles.largeAvatar, {backgroundColor: colors.primary + '10'}]}>
              <Icon name="log-in-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.profileMeta}>
              <Text style={[typography.h3, {color: colors.text, fontWeight: '700'}]}>
                Sign In / Register
              </Text>
              <Text
                style={[typography.bodySmall, {color: colors.textSecondary, marginTop: hp('0.3%')}]}>
                Please sign in to access your profile
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            },
          ]}>
          <Text
            style={[
              typography.bodySmall,
              {color: colors.text, fontWeight: '800', marginBottom: hp('1.5%')},
            ]}>
            Theme Preference
          </Text>
          <View style={styles.themeSelectorRow}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => {
              const isActive = currentThemeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => dispatch(setThemeMode(mode))}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Set theme to ${mode}`}
                  accessibilityState={{selected: isActive}}>
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isActive ? '#ffffff' : colors.text,
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      },
                    ]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            },
          ]}>
          <Text
            style={[
              typography.bodySmall,
              {color: colors.text, fontWeight: '800', marginBottom: hp('1.5%')},
            ]}>
            Preferences
          </Text>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Data and Privacy">
            <View style={styles.menuLabel}>
              <Icon
                name="shield-checkmark-outline"
                size={18}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <Text style={[typography.bodyMedium, {color: colors.text}]}>Data & Privacy</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            },
          ]}>
          <Text
            style={[
              typography.bodySmall,
              {color: colors.text, fontWeight: '800', marginBottom: hp('1.5%')},
            ]}>
            Support
          </Text>

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Help and FAQ">
            <View style={styles.menuLabel}>
              <Icon
                name="help-circle-outline"
                size={18}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <Text style={[typography.bodyMedium, {color: colors.text}]}>Help & FAQ</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Contact support">
            <View style={styles.menuLabel}>
              <Icon
                name="chatbubble-ellipses-outline"
                size={18}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <Text style={[typography.bodyMedium, {color: colors.text}]}>Contact Support</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Privacy policy">
            <View style={styles.menuLabel}>
              <Icon
                name="document-text-outline"
                size={18}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <Text style={[typography.bodyMedium, {color: colors.text}]}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Terms of service">
            <View style={styles.menuLabel}>
              <Icon
                name="reader-outline"
                size={18}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <Text style={[typography.bodyMedium, {color: colors.text}]}>Terms of Service</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {user && (
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {backgroundColor: colors.error + '10', borderColor: colors.error},
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log Out">
            <Icon
              name="log-out-outline"
              size={20}
              color={colors.warningLight}
              style={styles.menuIcon}
            />
            <Text style={[typography.bodyMedium, {color: colors.warningLight, fontWeight: '700'}]}>
              Log Out
            </Text>
          </TouchableOpacity>
        )}

        {}
        <View style={styles.footer}>
          <Text style={[typography.bodySmall, {color: colors.primary, fontWeight: '700'}]}>
            Community Hub
          </Text>
          <Text style={[typography.caption, {color: colors.textSecondary, marginTop: 2}]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
      </SafeAreaView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp('4%'),
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerUserMeta: {
    marginLeft: wp('3%'),
    flex: 1,
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: wp('6%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
    position: 'relative',
  },
  largeAvatar: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileMeta: {
    marginLeft: wp('4%'),
    flex: 1,
    paddingRight: wp('6%'),
  },
  moreButton: {
    position: 'absolute',
    top: hp('2%'),
    right: wp('4%'),
    padding: 4,
  },
  cardSection: {
    borderWidth: 1,
    padding: wp('5%'),
    marginBottom: hp('2.5%'),
  },
  themeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 0.31,
    paddingVertical: hp('1.2%'),
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1.5%'),
  },
  menuLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: wp('3%'),
  },
  divider: {
    height: 0.5,
    width: '100%',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: hp('1.8%'),
    marginBottom: hp('3.5%'),
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2%'),
  },
  skeletonProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    marginVertical: hp('1%'),
    borderWidth: 1.5,
  },
  skeletonItem: {
    height: hp('6.5%'),
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: wp('4%'),
  },
});
