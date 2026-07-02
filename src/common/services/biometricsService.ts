import { secureStorage } from '../storage/mmkv';

export interface BiometricCredentials {
  email: string;
  password: string;
}

export class BiometricsService {
  /**
   * Checks if biometric hardware (FaceID/TouchID/Fingerprint) is available.
   */
  public static async isBiometricsAvailable(): Promise<boolean> {
    // In a real application, you would check using expo-local-authentication or react-native-fingerprint-scanner.
    // For this mock enterprise implementation, we return true to demonstrate the configuration workflow.
    return true;
  }

  /**
   * Triggers the biometric prompt (FaceID or TouchID).
   */
  public static async authenticate(promptMessage: string = 'Scan your face or fingerprint to sign in'): Promise<boolean> {
    console.log(`[Biometrics] Triggering biometric dialog with prompt: "${promptMessage}"`);
    
    // Simulate biometric matching delay
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock successful scan
        console.log('[Biometrics] Scan successful.');
        resolve(true);
      }, 1000);
    });
  }

  /**
   * Stores login credentials securely for biometric authentication.
   */
  public static async saveBiometricCredentials(credentials: BiometricCredentials): Promise<void> {
    try {
      secureStorage.setString('biometric_cached_email', credentials.email);
      // In production, encrypt this password before saving to MMKV, or use react-native-keychain
      secureStorage.setString('biometric_cached_password', credentials.password);
      secureStorage.setBoolean('biometrics_enrolled', true);
      console.log('[Biometrics] Saved credentials securely for FaceID/TouchID.');
    } catch (e) {
      console.error('[Biometrics] Error saving credentials', e);
      throw new Error('Failed to save biometric credentials.');
    }
  }

  /**
   * Retrieves securely cached credentials for login.
   */
  public static async getBiometricCredentials(): Promise<BiometricCredentials | null> {
    const email = secureStorage.getString('biometric_cached_email');
    const password = secureStorage.getString('biometric_cached_password');
    const enrolled = secureStorage.getBoolean('biometrics_enrolled');

    if (enrolled && email && password) {
      return { email, password };
    }
    return null;
  }

  /**
   * Disables biometrics and clears cached credentials.
   */
  public static async clearBiometricCredentials(): Promise<void> {
    secureStorage.delete('biometric_cached_email');
    secureStorage.delete('biometric_cached_password');
    secureStorage.setBoolean('biometrics_enrolled', false);
    console.log('[Biometrics] Cleared biometrics registration.');
  }

  /**
   * Checks if the user has opted-in/enrolled biometrics for this app.
   */
  public static isEnrolled(): boolean {
    return secureStorage.getBoolean('biometrics_enrolled') || false;
  }
}
