import { biometricService } from '@/services/biometric';
import { Alert } from 'react-native';

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    prompt: jest.fn(),
  },
}));

// Mock React Native Biometrics
jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(),
    simplePrompt: jest.fn(),
  })),
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
}));

const mockedAlert = Alert as jest.Mocked<typeof Alert>;

describe('Biometric Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Biometric Availability', () => {
    it('should detect biometric availability correctly', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: 'TouchID',
        }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const isAvailable = await biometricService.isBiometricAvailable();

      expect(isAvailable).toBe(true);
      expect(mockInstance.isSensorAvailable).toHaveBeenCalled();
    });

    it('should handle biometric unavailability', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: false,
          biometryType: null,
        }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const isAvailable = await biometricService.isBiometricAvailable();

      expect(isAvailable).toBe(false);
    });

    it('should handle biometric errors gracefully', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockRejectedValue(new Error('Sensor error')),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const isAvailable = await biometricService.isBiometricAvailable();

      expect(isAvailable).toBe(false);
    });
  });

  describe('Biometric Authentication', () => {
    it('should authenticate with biometrics successfully', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: 'TouchID',
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: true }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle biometric authentication failure', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: 'TouchID',
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: false }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(false);
    });

    it('should handle biometric authentication errors', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: 'TouchID',
        }),
        simplePrompt: jest.fn().mockRejectedValue(new Error('Authentication failed')),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });
  });

  describe('Password Fallback', () => {
    it('should show password fallback when biometrics fail', async () => {
      mockedAlert.prompt.mockImplementation((title, message, buttons) => {
        // Simulate user entering password
        const unlockButton = buttons?.find(btn => btn.text === 'Unlock');
        if (unlockButton && unlockButton.onPress) {
          unlockButton.onPress('password123');
        }
        return undefined;
      });

      const result = await biometricService.showPasswordFallback();

      expect(result).toBe(true);
      expect(mockedAlert.prompt).toHaveBeenCalledWith(
        'Enter Password',
        'Please enter your password to unlock the app',
        expect.any(Array),
        'secure-text'
      );
    });

    it('should handle password fallback cancellation', async () => {
      mockedAlert.prompt.mockImplementation((title, message, buttons) => {
        // Simulate user canceling
        const cancelButton = buttons?.find(btn => btn.text === 'Cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
        return undefined;
      });

      const result = await biometricService.showPasswordFallback();

      expect(result).toBe(false);
    });

    it('should reject empty passwords', async () => {
      mockedAlert.prompt.mockImplementation((title, message, buttons) => {
        // Simulate user entering empty password
        const unlockButton = buttons?.find(btn => btn.text === 'Unlock');
        if (unlockButton && unlockButton.onPress) {
          unlockButton.onPress('');
        }
        return undefined;
      });

      const result = await biometricService.showPasswordFallback();

      expect(result).toBe(false);
    });
  });

  describe('App Unlock Flow', () => {
    it('should unlock with biometrics when available', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: 'TouchID',
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: true }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      const result = await biometricService.unlockApp();

      expect(result).toBe(true);
    });

    it('should fallback to password when biometrics unavailable', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: false,
          biometryType: null,
        }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      mockedAlert.prompt.mockImplementation((title, message, buttons) => {
        const unlockButton = buttons?.find(btn => btn.text === 'Unlock');
        if (unlockButton && unlockButton.onPress) {
          unlockButton.onPress('password123');
        }
        return undefined;
      });

      const result = await biometricService.unlockApp();

      expect(result).toBe(true);
    });

    it('should handle unlock failure gracefully', async () => {
      const mockBiometrics = require('react-native-biometrics').default;
      const mockInstance = {
        isSensorAvailable: jest.fn().mockResolvedValue({
          available: true,
          biometryType: 'TouchID',
        }),
        simplePrompt: jest.fn().mockResolvedValue({ success: false }),
      };
      mockBiometrics.mockImplementation(() => mockInstance);

      mockedAlert.prompt.mockImplementation((title, message, buttons) => {
        const cancelButton = buttons?.find(btn => btn.text === 'Cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
        return undefined;
      });

      const result = await biometricService.unlockApp();

      expect(result).toBe(false);
    });
  });
});
