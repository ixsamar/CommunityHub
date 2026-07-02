import { useAppSelector } from '../../../common/hooks/useAppSelector';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectIsBiometricsEnabled,
} from '../store/authSelectors';
import { authService } from '../services/authService';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const isBiometricsEnabled = useAppSelector(selectIsBiometricsEnabled);

  return {
    user,
    isAuthenticated,
    isLoading,
    isBiometricsEnabled,
    
    // Auth operations bound to authService context
    login: (credentials: Record<string, string>) => authService.login(credentials),
    logout: () => authService.logout(),
    biometricLogin: () => authService.biometricLogin(),
    toggleBiometricEnrollment: (enroll: boolean, credentials?: { email: string; password: string }) =>
      authService.toggleBiometricEnrollment(enroll, credentials),
    restoreSession: () => authService.restoreSession(),
  };
};
export type UseAuthResult = ReturnType<typeof useAuth>;
