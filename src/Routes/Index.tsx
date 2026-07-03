import React, { ComponentType, lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinkingOptions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../Utils/themeIndex';
import { useAuth } from '../Screens/auth/hooks/useAuth';
import { SplashScreen } from '../Screens/auth/SplashScreen';
import {
  AuthStackParamList,
  CommunityStackParamList,
  PostsStackParamList,
  ProfileStackParamList,
  HomeTabParamList,
  RootStackParamList,
} from '../Constance/globalTypes';

const lazyLoad = <T extends ComponentType<any>>(importFunc: () => Promise<{ default: T }>) => {
  const LazyComponent = lazy(importFunc);

  const LazyWrapper = (props: React.ComponentProps<T>) => (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      }>
      <LazyComponent {...props} />
    </Suspense>
  );

  LazyWrapper.displayName = 'LazyWrapper';
  return LazyWrapper;
};

const LoginScreen = lazyLoad(() =>
  import('../Screens/auth/LoginScreen').then(m => ({ default: m.LoginScreen })),
);
const RegisterScreen = lazyLoad(() =>
  import('../Screens/auth/RegisterScreen').then(m => ({ default: m.RegisterScreen })),
);
const CommunityListScreen = lazyLoad(() =>
  import('../Screens/community/CommunityListScreen').then(m => ({
    default: m.CommunityListScreen,
  })),
);
const CommunityDetailScreen = lazyLoad(() =>
  import('../Screens/community/CommunityDetailScreen').then(m => ({
    default: m.CommunityDetailScreen,
  })),
);
const PostListScreen = lazyLoad(() =>
  import('../Screens/posts/PostListScreen').then(m => ({ default: m.PostListScreen })),
);
const CreatePostScreen = lazyLoad(() =>
  import('../Screens/posts/CreatePostScreen').then(m => ({ default: m.CreatePostScreen })),
);
// Lazy loaded post details viewer screen
const PostDetailScreen = lazyLoad(() =>
  import('../Screens/posts/PostDetailScreen').then(m => ({ default: m.PostDetailScreen })),
);
const ProfileScreen = lazyLoad(() =>
  import('../Screens/profile/ProfileScreen').then(m => ({ default: m.ProfileScreen })),
);

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();
const PostsStack = createNativeStackNavigator<PostsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const CommunityNavigator = () => (
  <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
    <CommunityStack.Screen name="CommunityList" component={CommunityListScreen} />
    <CommunityStack.Screen name="CommunityDetails" component={CommunityDetailScreen} />
  </CommunityStack.Navigator>
);

const PostsNavigator = () => (
  <PostsStack.Navigator screenOptions={{ headerShown: false }}>
    <PostsStack.Screen name="PostList" component={PostListScreen} />
    <PostsStack.Screen name="CreatePost" component={CreatePostScreen} />
    <PostsStack.Screen name="PostDetails" component={PostDetailScreen} />
  </PostsStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
  </ProfileStack.Navigator>
);

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = '';
          if (route.name === 'CommunityTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'PostsTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="CommunityTab"
        component={CommunityNavigator}
        options={{ title: 'Communities' }}
      />
      <Tab.Screen name="PostsTab" component={PostsNavigator} options={{ title: 'Posts' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

import { useAppSelector } from '../Utils/hooks/useAppSelector';

export const RootNavigator = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="App" component={TabNavigator} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
    </RootStack.Navigator>
  );
};

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['communityhub://', 'https://communityhub.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
        },
      },
      App: {
        screens: {
          CommunityTab: {
            screens: {
              CommunityList: 'communities',
              CommunityDetails: 'communities/:communityId',
            },
          },
          PostsTab: {
            screens: {
              PostList: 'posts',
              CreatePost: 'posts/new',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
            },
          },
        },
      },
    },
  },
};
