import { BiometricService } from '../../services/biometric';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert } from 'react-native';

// Mock React Native Biometrics
const mockRNBiometrics = {
  isSensorAvailable: jest.fn(),
  simplePrompt: jest.fn(),
};

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn(() => mockRNBiometrics),
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    prompt: jest.fn(),
  },
}));

describe('BiometricService', () => {
  let biometricService: BiometricService;

  beforeEach(() => {
    biometricService = new BiometricService();
    jest.clearAllMocks();
  });

  describe('isBiometricAvailable', () => {
    it('should return true when biometrics are available', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: true,
        biometryType: 'TouchID',
      });

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(true);
    });

    it('should return false when biometrics are not available', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: false,
        biometryType: null,
      });

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(false);
    });

    it('should return false when sensor check fails', async () => {
      mockRNBiometrics.isSensorAvailable.mockRejectedValueOnce(new Error('Sensor error'));

      const result = await biometricService.isBiometricAvailable();

      expect(result).toBe(false);
    });
  });

  describe('authenticateWithBiometrics', () => {
    it('should authenticate successfully', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: true,
        biometryType: 'TouchID',
      });
      mockRNBiometrics.simplePrompt.mockResolvedValueOnce({ success: true });

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when biometrics not available', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: false,
        biometryType: null,
      });

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biometric authentication not available');
    });

    it('should return error when authentication fails', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: true,
        biometryType: 'TouchID',
      });
      mockRNBiometrics.simplePrompt.mockRejectedValueOnce(new Error('Auth failed'));

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });
  });

  describe('showPasswordFallback', () => {
    it('should resolve with true when password is provided', async () => {
      (Alert.prompt as jest.Mock).mockImplementationOnce((title, message, buttons, type) => {
        const unlockButton = buttons.find((btn: any) => btn.text === 'Unlock');
        if (unlockButton) {
          unlockButton.onPress('password123');
        }
      });

      const result = await biometricService.showPasswordFallback();

      expect(result).toBe(true);
    });

    it('should resolve with false when cancelled', async () => {
      (Alert.prompt as jest.Mock).mockImplementationOnce((title, message, buttons, type) => {
        const cancelButton = buttons.find((btn: any) => btn.text === 'Cancel');
        if (cancelButton) {
          cancelButton.onPress();
        }
      });

      const result = await biometricService.showPasswordFallback();

      expect(result).toBe(false);
    });

    it('should resolve with false when empty password', async () => {
      (Alert.prompt as jest.Mock).mockImplementationOnce((title, message, buttons, type) => {
        const unlockButton = buttons.find((btn: any) => btn.text === 'Unlock');
        if (unlockButton) {
          unlockButton.onPress('');
        }
      });

      const result = await biometricService.showPasswordFallback();

      expect(result).toBe(false);
    });
  });

  describe('unlockApp', () => {
    it('should unlock with biometrics when available', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: true,
        biometryType: 'TouchID',
      });
      mockRNBiometrics.simplePrompt.mockResolvedValueOnce({ success: true });

      const result = await biometricService.unlockApp();

      expect(result).toBe(true);
    });

    it('should fallback to password when biometrics fail', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: true,
        biometryType: 'TouchID',
      });
      mockRNBiometrics.simplePrompt.mockResolvedValueOnce({ success: false });

      (Alert.prompt as jest.Mock).mockImplementationOnce((title, message, buttons, type) => {
        const unlockButton = buttons.find((btn: any) => btn.text === 'Unlock');
        if (unlockButton) {
          unlockButton.onPress('password123');
        }
      });

      const result = await biometricService.unlockApp();

      expect(result).toBe(true);
    });

    it('should return false when both biometrics and password fail', async () => {
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: false,
        biometryType: null,
      });

      (Alert.prompt as jest.Mock).mockImplementationOnce((title, message, buttons, type) => {
        const cancelButton = buttons.find((btn: any) => btn.text === 'Cancel');
        if (cancelButton) {
          cancelButton.onPress();
        }
      });

      const result = await biometricService.unlockApp();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockRNBiometrics.isSensorAvailable.mockRejectedValueOnce(new Error('Sensor error'));

      const result = await biometricService.unlockApp();

      expect(result).toBe(false);
    });
  });
});
