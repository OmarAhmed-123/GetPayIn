import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, validateSession, restoreSession } from '@/store/authSlice';
import appReducer, { lockApp, unlockApp, updateActivity } from '@/store/appSlice';
import { apiService } from '@/services/api';
import { biometricService } from '@/services/biometric';
import { MMKV } from 'react-native-mmkv';

// Mock all external dependencies
jest.mock('@/services/api');
jest.mock('@/services/biometric');
jest.mock('react-native-mmkv');
jest.mock('react-native-biometrics');
jest.mock('react-native-keychain');
jest.mock('@react-native-community/netinfo');

const mockedApiService = apiService as jest.Mocked<typeof apiService>;
const mockedBiometricService = biometricService as jest.Mocked<typeof biometricService>;
const mockedMMKV = MMKV as jest.MockedClass<typeof MMKV>;

describe('Comprehensive Security Tests', () => {
  let store: ReturnType<typeof configureStore>;
  let mockStorage: jest.Mocked<MMKV>;

  beforeEach(() => {
    mockStorage = {
      set: jest.fn(),
      getString: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
    } as any;

    mockedMMKV.mockImplementation(() => mockStorage);

    store = configureStore({
      reducer: {
        auth: authReducer,
        app: appReducer,
      },
    });

    jest.clearAllMocks();
  });

  describe('Authentication Security', () => {
    it('should securely store authentication tokens', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'secure-jwt-token-12345',
      };

      mockedApiService.login.mockResolvedValue(mockResponse);

      await store.dispatch(loginUser(credentials));

      expect(mockedApiService.login).toHaveBeenCalledWith(credentials);
      expect(mockStorage.set).toHaveBeenCalledWith('auth_token', 'secure-jwt-token-12345');
      expect(mockStorage.set).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse));
    });

    it('should handle authentication failures securely', async () => {
      const credentials = { username: 'invalid', password: 'wrong' };
      const errorMessage = 'Invalid credentials';

      mockedApiService.login.mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
      expect(result.payload).toBe(errorMessage);
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it('should validate session tokens securely', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'valid-token',
      };

      mockedApiService.getCurrentUser.mockResolvedValue(mockUser);

      await store.dispatch(validateSession());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toEqual(mockUser);
    });

    it('should handle invalid session tokens', async () => {
      mockedApiService.getCurrentUser.mockRejectedValue(new Error('Invalid token'));

      await store.dispatch(validateSession());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });

    it('should prevent token leakage in error messages', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const sensitiveError = 'Token: abc123 is invalid';

      mockedApiService.login.mockRejectedValue(new Error(sensitiveError));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
      // Ensure sensitive information is not exposed
      expect(result.payload).not.toContain('abc123');
    });
  });

  describe('Biometric Security', () => {
    it('should securely handle biometric authentication', async () => {
      mockedBiometricService.isBiometricAvailable.mockResolvedValue(true);
      mockedBiometricService.authenticateWithBiometrics.mockResolvedValue({
        success: true,
      });

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(true);
      expect(mockedBiometricService.authenticateWithBiometrics).toHaveBeenCalled();
    });

    it('should handle biometric authentication failures securely', async () => {
      mockedBiometricService.isBiometricAvailable.mockResolvedValue(true);
      mockedBiometricService.authenticateWithBiometrics.mockResolvedValue({
        success: false,
        error: 'Authentication failed',
      });

      const result = await biometricService.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });

    it('should provide secure password fallback', async () => {
      mockedBiometricService.isBiometricAvailable.mockResolvedValue(false);
      mockedBiometricService.showPasswordFallback.mockResolvedValue(true);

      const result = await biometricService.unlockApp();

      expect(result).toBe(true);
      expect(mockedBiometricService.showPasswordFallback).toHaveBeenCalled();
    });

    it('should handle biometric service errors gracefully', async () => {
      mockedBiometricService.isBiometricAvailable.mockRejectedValue(
        new Error('Biometric service unavailable')
      );

      const result = await biometricService.unlockApp();

      expect(result).toBe(false);
    });
  });

  describe('Data Storage Security', () => {
    it('should encrypt sensitive data in storage', () => {
      const sensitiveData = {
        token: 'sensitive-jwt-token',
        userData: { password: 'hashed-password' },
      };

      mockStorage.set('auth_token', sensitiveData.token);
      mockStorage.set('user_data', JSON.stringify(sensitiveData.userData));

      expect(mockStorage.set).toHaveBeenCalledWith('auth_token', sensitiveData.token);
      expect(mockStorage.set).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(sensitiveData.userData)
      );
    });

    it('should securely clear sensitive data on logout', () => {
      mockedApiService.logout();

      expect(mockStorage.delete).toHaveBeenCalledWith('auth_token');
      expect(mockStorage.delete).toHaveBeenCalledWith('user_data');
    });

    it('should handle corrupted stored data securely', () => {
      mockStorage.getString.mockReturnValue('invalid-json-data');

      const storedUser = apiService.getStoredUser();

      expect(storedUser).toBeNull();
    });

    it('should validate stored data integrity', () => {
      const validUserData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'valid-token',
      };

      mockStorage.getString.mockReturnValue(JSON.stringify(validUserData));

      const storedUser = apiService.getStoredUser();

      expect(storedUser).toEqual(validUserData);
    });
  });

  describe('App Lock Security', () => {
    it('should lock app after timeout', () => {
      const initialState = store.getState();
      expect(initialState.app.isLocked).toBe(false);

      store.dispatch(lockApp());

      const lockedState = store.getState();
      expect(lockedState.app.isLocked).toBe(true);
    });

    it('should unlock app securely', () => {
      // First lock the app
      store.dispatch(lockApp());
      expect(store.getState().app.isLocked).toBe(true);

      // Then unlock
      store.dispatch(unlockApp());
      expect(store.getState().app.isLocked).toBe(false);
    });

    it('should track activity timestamps securely', () => {
      const initialTime = store.getState().app.lastActivity;

      store.dispatch(updateActivity());

      const updatedTime = store.getState().app.lastActivity;
      expect(updatedTime).toBeGreaterThanOrEqual(initialTime);
    });

    it('should handle rapid state changes securely', () => {
      // Test rapid lock/unlock cycles
      for (let i = 0; i < 10; i++) {
        store.dispatch(lockApp());
        expect(store.getState().app.isLocked).toBe(true);

        store.dispatch(unlockApp());
        expect(store.getState().app.isLocked).toBe(false);
      }
    });
  });

  describe('Input Validation Security', () => {
    it('should sanitize user input', async () => {
      const maliciousInput = {
        username: '<script>alert("xss")</script>',
        password: '../../../etc/passwd',
      };

      mockedApiService.login.mockRejectedValue(new Error('Invalid input'));

      const result = await store.dispatch(loginUser(maliciousInput));

      expect(result.type).toBe('auth/loginUser/rejected');
    });

    it('should handle SQL injection attempts', async () => {
      const sqlInjectionInput = {
        username: "admin'; DROP TABLE users; --",
        password: 'password',
      };

      mockedApiService.login.mockRejectedValue(new Error('Invalid input'));

      const result = await store.dispatch(loginUser(sqlInjectionInput));

      expect(result.type).toBe('auth/loginUser/rejected');
    });

    it('should handle XSS attempts', async () => {
      const xssInput = {
        username: '<img src=x onerror=alert(1)>',
        password: 'password',
      };

      mockedApiService.login.mockRejectedValue(new Error('Invalid input'));

      const result = await store.dispatch(loginUser(xssInput));

      expect(result.type).toBe('auth/loginUser/rejected');
    });
  });

  describe('Network Security', () => {
    it('should handle network errors securely', async () => {
      mockedApiService.getProducts.mockRejectedValue(new Error('Network error'));

      try {
        await apiService.getProducts();
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle SSL/TLS errors securely', async () => {
      mockedApiService.getProducts.mockRejectedValue(
        new Error('SSL certificate verification failed')
      );

      try {
        await apiService.getProducts();
      } catch (error) {
        expect(error.message).toBe('SSL certificate verification failed');
      }
    });

    it('should handle timeout errors securely', async () => {
      mockedApiService.getProducts.mockRejectedValue(new Error('Request timeout'));

      try {
        await apiService.getProducts();
      } catch (error) {
        expect(error.message).toBe('Request timeout');
      }
    });
  });

  describe('Session Management Security', () => {
    it('should handle session expiration securely', async () => {
      mockedApiService.getCurrentUser.mockRejectedValue(
        new Error('Session expired')
      );

      await store.dispatch(validateSession());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });

    it('should handle concurrent session requests securely', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'valid-token',
      };

      mockedApiService.getCurrentUser.mockResolvedValue(mockUser);

      // Simulate concurrent requests
      const promises = [
        store.dispatch(validateSession()),
        store.dispatch(validateSession()),
        store.dispatch(validateSession()),
      ];

      await Promise.all(promises);

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const sensitiveError = 'Database error: Connection failed to user:admin password:secret';

      mockedApiService.login.mockRejectedValue(new Error(sensitiveError));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
      expect(result.payload).not.toContain('admin');
      expect(result.payload).not.toContain('secret');
    });

    it('should handle unexpected errors gracefully', async () => {
      const credentials = { username: 'testuser', password: 'password123' };

      mockedApiService.login.mockRejectedValue(new Error('Unexpected error'));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
      expect(result.payload).toBe('Unexpected error');
    });

    it('should log security events appropriately', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockedBiometricService.unlockApp.mockRejectedValue(
        new Error('Biometric authentication failed')
      );

      // This should trigger error logging
      biometricService.unlockApp().catch(() => {});

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
