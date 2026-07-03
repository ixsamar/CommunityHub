import {NavigatorScreenParams} from '@react-navigation/native';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserProfile extends User {
  bio?: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  isPrivate: boolean;
  createdAt: string;
  image?: string;
  isJoined?: boolean;
  postsCount?: number;
}

export interface CommunityQueryParams {
  search?: string;
  sort?: 'name' | 'members' | 'recent';
  filter?: 'all' | 'public' | 'private';
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
  isPrivate: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  communityId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isPending?: boolean;
  isFailed?: boolean;
  clientPostId?: string;
  images?: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  communityId: string;
  clientPostId?: string;
  images?: string[];
}

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CommunityStackParamList = {
  CommunityList: undefined;
  CommunityDetails: {communityId: string};
};

export type PostsStackParamList = {
  PostList: undefined;
  PostDetails: {postId: string};
  CreatePost: {communityId?: string; editPostId?: string} | undefined;
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
