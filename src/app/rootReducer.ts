import {combineReducers} from '@reduxjs/toolkit';
import {baseApi} from '../common/api/baseApi';
import {themeReducer} from '../theme/themeSlice';
import {authReducer} from '../features/auth/store/authSlice';
import {communityReducer} from '../features/community/store/communitySlice';
import {postsReducer} from '../features/posts/store/postsSlice';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  theme: themeReducer,
  auth: authReducer,
  community: communityReducer,
  posts: postsReducer,
});
