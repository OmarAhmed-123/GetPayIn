import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock useAppLock hook
jest.mock('../../hooks/useAppLock', () => ({
  useAppLock: jest.fn(() => ({
    updateActivityTime: jest.fn(),
  })),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginScreen', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      signOut: jest.fn(),
      isSuperAdmin: jest.fn(() => false),
    });
  });

  it('should render login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Use Demo Credentials')).toBeTruthy();
  });

  it('should update username input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const usernameInput = getByPlaceholderText('Username');

    fireEvent.changeText(usernameInput, 'testuser');

    expect(usernameInput.props.value).toBe('testuser');
  });

  it('should update password input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('should toggle password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Password');
    const eyeIcon = getByTestId('eye-icon');

    // Initially password should be hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Toggle visibility
    fireEvent.press(eyeIcon);

    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it('should call login with credentials when sign in is pressed', async () => {
    mockLogin.mockResolvedValue({ type: 'fulfilled' });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('should show loading state when login is in progress', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: mockLogin,
      signOut: jest.fn(),
      isSuperAdmin: jest.fn(() => false),
    });

    const { getByTestId } = render(<LoginScreen />);

    expect(getByTestId('login-button')).toBeDisabled();
  });

  it('should display error message when login fails', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid credentials',
      login: mockLogin,
      signOut: jest.fn(),
      isSuperAdmin: jest.fn(() => false),
    });

    const { getByText } = render(<LoginScreen />);

    expect(getByText('Invalid credentials')).toBeTruthy();
  });

  it('should fill demo credentials when demo button is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Use Demo Credentials'));

    expect(getByPlaceholderText('Username').props.value).toBe('emilys');
    expect(getByPlaceholderText('Password').props.value).toBe('emilyspass');
  });

  it('should disable demo button when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: mockLogin,
      signOut: jest.fn(),
      isSuperAdmin: jest.fn(() => false),
    });

    const { getByText } = render(<LoginScreen />);

    expect(getByText('Use Demo Credentials').parent).toBeDisabled();
  });
});
