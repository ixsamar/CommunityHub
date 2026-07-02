import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store';
import { AuthState } from './authSlice';

const selectAuthState = (state: RootState): AuthState => state.auth;

export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectIsBiometricsEnabled = createSelector(
  [selectAuthState],
  (auth) => auth.isBiometricsEnabled
);
