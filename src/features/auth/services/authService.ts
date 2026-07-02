/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
import { AuthRepository, IAuthRepository } from './authRepository';
import { BiometricsService } from '../../../common/services/biometricsService';
import { secureStorage } from '../../../common/storage/mmkv';
import { User } from '../types';

export class AuthService {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository = new AuthRepository()) {
    this.authRepository = authRepository;
  }

  /**
   * Recovers existing session from MMKV secure storage on startup.
   */
  public async restoreSession(): Promise<boolean> {
    try {
      const user = await this.authRepository.getCurrentUser();
      const token = secureStorage.getString('auth_token');
      const refreshToken = secureStorage.getString('auth_refresh_token');

      if (user && token && refreshToken) {
        console.log('[AuthService] Restoring session for user:', user.email);
        
        // Dynamically require store to avoid import loop
        const { store } = require('../../../app/store');
        const { setCredentials } = require('../store/authSlice');
        
        store.dispatch(setCredentials({ user, token, refreshToken }));
        return true;
      }
    } catch (e) {
      console.error('[AuthService] Session restoration failed:', e);
    } finally {
      const { store } = require('../../../app/store');
      const { setLoading } = require('../store/authSlice');
      store.dispatch(setLoading(false));
    }
    return false;
  }

  /**
   * Standard login flow.
   */
  public async login(credentials: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    const result = await this.authRepository.login(credentials);
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }

    if (result.data) {
      const { user, token } = result.data;
      const refreshToken = secureStorage.getString('auth_refresh_token') || '';
      
      const { store } = require('../../../app/store');
      const { setCredentials } = require('../store/authSlice');
      store.dispatch(setCredentials({ user, token, refreshToken }));

      // If biometrics are enabled, cache credentials for quick login next time
      const isBiometricsOptedIn = BiometricsService.isEnrolled();
      if (isBiometricsOptedIn) {
        await BiometricsService.saveBiometricCredentials({
          email: credentials.email,
          password: credentials.password,
        });
      }

      return { success: true };
    }

    return { success: false, error: 'Unknown authentication error.' };
  }

  /**
   * Log out flow.
   */
  public async logout(): Promise<void> {
    await this.authRepository.logout();
    
    const { store } = require('../../../app/store');
    const { clearCredentials } = require('../store/authSlice');
    store.dispatch(clearCredentials());
  }

  /**
   * Biometric Login flow using TouchID or FaceID.
   */
  public async biometricLogin(): Promise<{ success: boolean; error?: string }> {
    const isEnrolled = BiometricsService.isEnrolled();
    if (!isEnrolled) {
      return { success: false, error: 'Biometric login is not enrolled on this device.' };
    }

    const available = await BiometricsService.isBiometricsAvailable();
    if (!available) {
      return { success: false, error: 'Biometric hardware is not available.' };
    }

    // Trigger FaceID/TouchID prompt
    const authenticated = await BiometricsService.authenticate();
    if (!authenticated) {
      return { success: false, error: 'Biometric authentication failed.' };
    }

    // Retrieve cached credentials
    const credentials = await BiometricsService.getBiometricCredentials();
    if (!credentials) {
      return { success: false, error: 'No cached credentials found for biometrics.' };
    }

    // Perform standard login using cached credentials
    return this.login({
      email: credentials.email,
      password: credentials.password,
    });
  }

  /**
   * Enrolls or disables biometric authentication for the current user.
   */
  public async toggleBiometricEnrollment(enroll: boolean, credentials?: { email: string; password: string }): Promise<void> {
    if (enroll && credentials) {
      await BiometricsService.saveBiometricCredentials(credentials);
      
      const { store } = require('../../../app/store');
      const { setBiometricsEnabled } = require('../store/authSlice');
      store.dispatch(setBiometricsEnabled(true));
    } else {
      await BiometricsService.clearBiometricCredentials();
      
      const { store } = require('../../../app/store');
      const { setBiometricsEnabled } = require('../store/authSlice');
      store.dispatch(setBiometricsEnabled(false));
    }
  }
}

export const authService = new AuthService();
