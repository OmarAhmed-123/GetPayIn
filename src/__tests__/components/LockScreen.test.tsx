import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LockScreen from '../../components/LockScreen';
import { useAppLock } from '../../hooks/useAppLock';

// Mock useAppLock hook
jest.mock('../../hooks/useAppLock', () => ({
  useAppLock: jest.fn(),
}));

const mockUseAppLock = useAppLock as jest.MockedFunction<typeof useAppLock>;

describe('LockScreen', () => {
  const mockUnlockWithBiometrics = jest.fn();
  const mockUpdateActivityTime = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppLock.mockReturnValue({
      isLocked: false,
      updateActivityTime: mockUpdateActivityTime,
      lock: jest.fn(),
      unlock: jest.fn(),
      unlockWithBiometrics: mockUnlockWithBiometrics,
    });
  });

  it('should not render when visible is false', () => {
    const { queryByTestId } = render(<LockScreen visible={false} />);

    expect(queryByTestId('lock-screen')).toBeNull();
  });

  it('should render when visible is true', () => {
    const { getByTestId, getByText } = render(<LockScreen visible={true} />);

    expect(getByTestId('lock-screen')).toBeTruthy();
    expect(getByText('App Locked')).toBeTruthy();
    expect(getByText('Use biometrics or password to unlock')).toBeTruthy();
  });

  it('should call unlockWithBiometrics when unlock button is pressed', async () => {
    mockUnlockWithBiometrics.mockResolvedValue(true);

    const { getByTestId } = render(<LockScreen visible={true} />);

    fireEvent.press(getByTestId('unlock-button'));

    await waitFor(() => {
      expect(mockUnlockWithBiometrics).toHaveBeenCalled();
    });
  });

  it('should show loading state when unlocking', async () => {
    mockUnlockWithBiometrics.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(<LockScreen visible={true} />);

    fireEvent.press(getByTestId('unlock-button'));

    await waitFor(() => {
      expect(getByTestId('unlock-button')).toBeDisabled();
    });
  });

  it('should handle unlock failure', async () => {
    mockUnlockWithBiometrics.mockResolvedValue(false);

    const { getByTestId } = render(<LockScreen visible={true} />);

    fireEvent.press(getByTestId('unlock-button'));

    await waitFor(() => {
      expect(mockUnlockWithBiometrics).toHaveBeenCalled();
    });
  });

  it('should handle unlock error', async () => {
    mockUnlockWithBiometrics.mockRejectedValue(new Error('Unlock failed'));

    const { getByTestId } = render(<LockScreen visible={true} />);

    fireEvent.press(getByTestId('unlock-button'));

    await waitFor(() => {
      expect(mockUnlockWithBiometrics).toHaveBeenCalled();
    });
  });
});
