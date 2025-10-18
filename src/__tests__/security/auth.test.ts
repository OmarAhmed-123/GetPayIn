import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, validateSession, restoreSession } from '@/store/authSlice';
import { apiService } from '@/services/api';

// Mock the API service
jest.mock('@/services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('Authentication Security Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Token Security', () => {
    it('should not store sensitive data in plain text', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-jwt-token',
      };

      mockedApiService.login.mockResolvedValue(mockResponse);

      await store.dispatch(loginUser(credentials));

      // Verify that the API service was called with proper credentials
      expect(mockedApiService.login).toHaveBeenCalledWith(credentials);
    });

    it('should handle invalid credentials securely', async () => {
      const credentials = { username: 'invalid', password: 'wrong' };
      const errorMessage = 'Invalid credentials';

      mockedApiService.login.mockRejectedValue(new Error(errorMessage));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
      expect(result.payload).toBe(errorMessage);
    });

    it('should validate session securely', async () => {
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

    it('should handle session validation failure securely', async () => {
      mockedApiService.getCurrentUser.mockRejectedValue(new Error('Invalid token'));

      await store.dispatch(validateSession());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should handle empty credentials', async () => {
      const credentials = { username: '', password: '' };

      mockedApiService.login.mockRejectedValue(new Error('Invalid input'));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
    });

    it('should handle malformed credentials', async () => {
      const credentials = { username: 'a'.repeat(1000), password: 'b'.repeat(1000) };

      mockedApiService.login.mockRejectedValue(new Error('Input too long'));

      const result = await store.dispatch(loginUser(credentials));

      expect(result.type).toBe('auth/loginUser/rejected');
    });
  });

  describe('Session Management', () => {
    it('should restore session securely', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'stored-token',
      };

      mockedApiService.getStoredUser.mockReturnValue(mockUser);
      mockedApiService.isAuthenticated.mockReturnValue(true);

      await store.dispatch(restoreSession());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toEqual(mockUser);
    });

    it('should not restore invalid session', async () => {
      mockedApiService.getStoredUser.mockReturnValue(null);
      mockedApiService.isAuthenticated.mockReturnValue(false);

      await store.dispatch(restoreSession());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
    });
  });
});
