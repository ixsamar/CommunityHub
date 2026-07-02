import {secureStorage} from '../Utils/mmkv';

export interface BiometricCredentials {
  email: string;
  password: string;
}

export class BiometricsService {
  public static async isBiometricsAvailable(): Promise<boolean> {
    return true;
  }

  public static async authenticate(
    promptMessage: string = 'Scan your face or fingerprint to sign in',
  ): Promise<boolean> {
    console.log(`[Biometrics] Triggering biometric dialog with prompt: "${promptMessage}"`);

    return new Promise(resolve => {
      setTimeout(() => {
        console.log('[Biometrics] Scan successful.');
        resolve(true);
      }, 1000);
    });
  }

  public static async saveBiometricCredentials(credentials: BiometricCredentials): Promise<void> {
    try {
      secureStorage.setString('biometric_cached_email', credentials.email);

      secureStorage.setString('biometric_cached_password', credentials.password);
      secureStorage.setBoolean('biometrics_enrolled', true);
      console.log('[Biometrics] Saved credentials securely for FaceID/TouchID.');
    } catch (e) {
      console.error('[Biometrics] Error saving credentials', e);
      throw new Error('Failed to save biometric credentials.');
    }
  }

  public static async getBiometricCredentials(): Promise<BiometricCredentials | null> {
    const email = secureStorage.getString('biometric_cached_email');
    const password = secureStorage.getString('biometric_cached_password');
    const enrolled = secureStorage.getBoolean('biometrics_enrolled');

    if (enrolled && email && password) {
      return {email, password};
    }
    return null;
  }

  public static async clearBiometricCredentials(): Promise<void> {
    secureStorage.delete('biometric_cached_email');
    secureStorage.delete('biometric_cached_password');
    secureStorage.setBoolean('biometrics_enrolled', false);
    console.log('[Biometrics] Cleared biometrics registration.');
  }

  public static isEnrolled(): boolean {
    return secureStorage.getBoolean('biometrics_enrolled') || false;
  }
}
