import {combineReducers} from '@reduxjs/toolkit';
import {baseApi} from '../APIServices/baseApi';
import {themeReducer} from './slices/themeSlice';
import {authReducer} from './slices/authSlice';
import {communityReducer} from './slices/communitySlice';
import {postsReducer} from './slices/postsSlice';

export const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  theme: themeReducer,
  auth: authReducer,
  community: communityReducer,
  posts: postsReducer,
});
