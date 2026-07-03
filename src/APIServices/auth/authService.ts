import {AuthRepository, IAuthRepository} from './authRepository';
import {BiometricsService} from '../biometricsService';
import {secureStorage} from '../../Utils/mmkv';
import {User} from '../../Constance/globalTypes';

export class AuthService {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository = new AuthRepository()) {
    this.authRepository = authRepository;
  }

  public async restoreSession(): Promise<boolean> {
    try {
      const user = await this.authRepository.getCurrentUser();
      const token = secureStorage.getString('auth_token');
      const refreshToken = secureStorage.getString('auth_refresh_token');

      if (user && token && refreshToken) {
        console.log('[AuthService] Restoring session for user:', user.email);

        const {store} = require('../../Store/store');
        const {setCredentials} = require('../../Store/slices/authSlice');

        store.dispatch(setCredentials({user, token, refreshToken}));
        return true;
      }
    } catch (e) {
      console.error('[AuthService] Session restoration failed:', e);
    } finally {
      const {store} = require('../../Store/store');
      const {setLoading} = require('../../Store/slices/authSlice');
      store.dispatch(setLoading(false));
    }
    return false;
  }

  public async login(
    credentials: Record<string, string>,
  ): Promise<{success: boolean; error?: string}> {
    const result = await this.authRepository.login(credentials);

    if (result.error) {
      return {success: false, error: result.error.message};
    }

    if (result.data) {
      const {user, token} = result.data;
      const refreshToken = secureStorage.getString('auth_refresh_token') || '';

      const {store} = require('../../Store/store');
      const {setCredentials} = require('../../Store/slices/authSlice');
      store.dispatch(setCredentials({user, token, refreshToken}));

      const isBiometricsOptedIn = BiometricsService.isEnrolled();
      if (isBiometricsOptedIn) {
        await BiometricsService.saveBiometricCredentials({
          email: credentials.email,
          password: credentials.password,
        });
      }

      return {success: true};
    }

    return {success: false, error: 'Unknown authentication error.'};
  }

  public async register(
    credentials: Record<string, string>,
  ): Promise<{success: boolean; error?: string}> {
    const result = await this.authRepository.register(credentials);

    if (result.error) {
      return {success: false, error: result.error.message};
    }

    if (result.data) {
      const {user, token} = result.data;
      const refreshToken = secureStorage.getString('auth_refresh_token') || '';

      const {store} = require('../../Store/store');
      const {setCredentials} = require('../../Store/slices/authSlice');
      store.dispatch(setCredentials({user, token, refreshToken}));

      return {success: true};
    }

    return {success: false, error: 'Unknown registration error.'};
  }

  public async logout(): Promise<void> {
    await this.authRepository.logout();

    const {store} = require('../../Store/store');
    const {clearCredentials} = require('../../Store/slices/authSlice');
    store.dispatch(clearCredentials());
  }

  public async biometricLogin(): Promise<{success: boolean; error?: string}> {
    const isEnrolled = BiometricsService.isEnrolled();
    if (!isEnrolled) {
      return {success: false, error: 'Biometric login is not enrolled on this device.'};
    }

    const available = await BiometricsService.isBiometricsAvailable();
    if (!available) {
      return {success: false, error: 'Biometric hardware is not available.'};
    }

    const authenticated = await BiometricsService.authenticate();
    if (!authenticated) {
      return {success: false, error: 'Biometric authentication failed.'};
    }

    const credentials = await BiometricsService.getBiometricCredentials();
    if (!credentials) {
      return {success: false, error: 'No cached credentials found for biometrics.'};
    }

    return this.login({
      email: credentials.email,
      password: credentials.password,
    });
  }

  public async toggleBiometricEnrollment(
    enroll: boolean,
    credentials?: {email: string; password: string},
  ): Promise<void> {
    if (enroll && credentials) {
      await BiometricsService.saveBiometricCredentials(credentials);

      const {store} = require('../../Store/store');
      const {setBiometricsEnabled} = require('../../Store/slices/authSlice');
      store.dispatch(setBiometricsEnabled(true));
    } else {
      await BiometricsService.clearBiometricCredentials();

      const {store} = require('../../Store/store');
      const {setBiometricsEnabled} = require('../../Store/slices/authSlice');
      store.dispatch(setBiometricsEnabled(false));
    }
  }
}

export const authService = new AuthService();
