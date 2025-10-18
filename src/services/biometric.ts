import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export interface BiometricResult {
  success: boolean;
  error?: string;
}

export class BiometricService {
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return available && (biometryType === BiometryTypes.TouchID || biometryType === BiometryTypes.FaceID || biometryType === BiometryTypes.Biometrics);
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  async authenticateWithBiometrics(): Promise<BiometricResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock the app',
        cancelButtonText: 'Cancel',
      });

      return { success };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async showPasswordFallback(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.prompt(
        'Enter Password',
        'Please enter your password to unlock the app',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Unlock',
            onPress: (password?: string) => {
              // In a real app, you would verify the password here
              // For this demo, we'll accept any non-empty password
              resolve(password ? password.length > 0 : false);
            },
          },
        ],
        'secure-text'
      );
    });
  }

  async unlockApp(): Promise<boolean> {
    try {
      const isBiometricAvailable = await this.isBiometricAvailable();
      
      if (isBiometricAvailable) {
        const biometricResult = await this.authenticateWithBiometrics();
        if (biometricResult.success) {
          return true;
        }
      }

      // Fallback to password
      return await this.showPasswordFallback();
    } catch (error) {
      console.error('Unlock failed:', error);
      return false;
    }
  }
}

export const biometricService = new BiometricService();
