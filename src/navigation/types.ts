import {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type CommunityStackParamList = {
  CommunityList: undefined;
  CommunityDetails: {communityId: string};
};

export type PostsStackParamList = {
  PostList: undefined;
  PostDetails: {postId: string};
  CreatePost: {communityId?: string} | undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type HomeTabParamList = {
  CommunityTab: NavigatorScreenParams<CommunityStackParamList>;
  PostsTab: NavigatorScreenParams<PostsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<HomeTabParamList>;
};
