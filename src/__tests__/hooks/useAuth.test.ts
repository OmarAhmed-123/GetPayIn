import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, restoreSession, logout } from '../../store/authSlice';

// Mock Redux
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockSelector(selector),
}));

// Mock store actions
jest.mock('../../store/authSlice', () => ({
  loginUser: jest.fn(),
  restoreSession: jest.fn(),
  logout: jest.fn(),
}));

describe('useAuth', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    gender: 'male',
    image: 'https://example.com/avatar.jpg',
    token: 'mock_token_123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();
    mockSelector.mockClear();
  });

  it('should return auth state from selector', () => {
    const mockAuthState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    mockSelector.mockReturnValue(mockAuthState);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should dispatch restoreSession on mount', () => {
    mockSelector.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    renderHook(() => useAuth());

    expect(mockDispatch).toHaveBeenCalledWith(restoreSession());
  });

  it('should call login with credentials', async () => {
    mockSelector.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    const credentials = { username: 'testuser', password: 'password123' };
    await act(async () => {
      await result.current.login(credentials);
    });

    expect(mockDispatch).toHaveBeenCalledWith(loginUser(credentials));
  });

  it('should call signOut', () => {
    mockSelector.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signOut();
    });

    expect(mockDispatch).toHaveBeenCalledWith(logout());
  });

  it('should identify superadmin correctly', () => {
    const superadminUser = {
      ...mockUser,
      username: 'superadmin',
    };

    mockSelector.mockReturnValue({
      user: superadminUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isSuperAdmin()).toBe(true);
  });

  it('should identify non-superadmin correctly', () => {
    mockSelector.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isSuperAdmin()).toBe(false);
  });

  it('should handle null user in isSuperAdmin', () => {
    mockSelector.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isSuperAdmin()).toBe(false);
  });
});
