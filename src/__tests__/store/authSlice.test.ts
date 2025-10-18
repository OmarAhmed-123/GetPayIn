import authReducer, { loginUser, validateSession, restoreSession, logout, clearError, setUser } from '../../store/authSlice';
import { apiService } from '../../services/api';

// Mock API service
jest.mock('../../services/api', () => ({
  apiService: {
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    getStoredUser: jest.fn(),
    isAuthenticated: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle logout', () => {
      const state = {
        ...initialState,
        user: { id: 1, username: 'test' } as any,
        isAuthenticated: true,
      };

      const newState = authReducer(state, logout());

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBeNull();
      expect(apiService.logout).toHaveBeenCalled();
    });

    it('should handle clearError', () => {
      const state = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(state, clearError());

      expect(newState.error).toBeNull();
    });

    it('should handle setUser', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      const newState = authReducer(initialState, setUser(user));

      expect(newState.user).toEqual(user);
      expect(newState.isAuthenticated).toBe(true);
    });
  });

  describe('loginUser async thunk', () => {
    it('should handle loginUser.pending', () => {
      const action = { type: loginUser.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle loginUser.fulfilled', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      const action = {
        type: loginUser.fulfilled.type,
        payload: user,
      };

      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(user);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle loginUser.rejected', () => {
      const errorMessage = 'Login failed';
      const action = {
        type: loginUser.rejected.type,
        payload: errorMessage,
      };

      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });
  });

  describe('validateSession async thunk', () => {
    it('should handle validateSession.pending', () => {
      const action = { type: validateSession.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('should handle validateSession.fulfilled', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      const action = {
        type: validateSession.fulfilled.type,
        payload: user,
      };

      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(user);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle validateSession.rejected', () => {
      const errorMessage = 'Session validation failed';
      const action = {
        type: validateSession.rejected.type,
        payload: errorMessage,
      };

      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });
  });

  describe('restoreSession async thunk', () => {
    it('should handle restoreSession.fulfilled with user', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      const action = {
        type: restoreSession.fulfilled.type,
        payload: user,
      };

      const newState = authReducer(initialState, action);

      expect(newState.user).toEqual(user);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should handle restoreSession.fulfilled with null', () => {
      const action = {
        type: restoreSession.fulfilled.type,
        payload: null,
      };

      const newState = authReducer(initialState, action);

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });
});
