import { renderHook, act } from '@testing-library/react-hooks';
import { useAppLock } from '../../hooks/useAppLock';
import { useDispatch, useSelector } from 'react-redux';
import { lockApp, unlockApp, updateActivity } from '../../store/appSlice';
import { useAuth } from '../../hooks/useAuth';
import { biometricService } from '../../services/biometric';
import { AppState } from 'react-native';

// Mock Redux
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockSelector(selector),
}));

// Mock useAuth
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock biometric service
jest.mock('../../services/biometric', () => ({
  biometricService: {
    unlockApp: jest.fn(),
  },
}));

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

describe('useAppLock', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();
    mockSelector.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return app lock state from selector', () => {
    const mockAppState = {
      isLocked: false,
      lastActivity: Date.now(),
      isOnline: true,
    };

    mockSelector.mockReturnValue(mockAppState);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { result } = renderHook(() => useAppLock());

    expect(result.current.isLocked).toBe(false);
  });

  it('should update activity time', () => {
    mockSelector.mockReturnValue({
      isLocked: false,
      lastActivity: Date.now(),
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { result } = renderHook(() => useAppLock());

    act(() => {
      result.current.updateActivityTime();
    });

    expect(mockDispatch).toHaveBeenCalledWith(updateActivity());
  });

  it('should lock the app', () => {
    mockSelector.mockReturnValue({
      isLocked: false,
      lastActivity: Date.now(),
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { result } = renderHook(() => useAppLock());

    act(() => {
      result.current.lock();
    });

    expect(mockDispatch).toHaveBeenCalledWith(lockApp());
  });

  it('should unlock the app', () => {
    mockSelector.mockReturnValue({
      isLocked: true,
      lastActivity: Date.now(),
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    const { result } = renderHook(() => useAppLock());

    act(() => {
      result.current.unlock();
    });

    expect(mockDispatch).toHaveBeenCalledWith(unlockApp());
  });

  it('should unlock with biometrics successfully', async () => {
    mockSelector.mockReturnValue({
      isLocked: true,
      lastActivity: Date.now(),
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);
    (biometricService.unlockApp as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useAppLock());

    let unlockResult: boolean;
    await act(async () => {
      unlockResult = await result.current.unlockWithBiometrics();
    });

    expect(unlockResult!).toBe(true);
    expect(mockDispatch).toHaveBeenCalledWith(unlockApp());
  });

  it('should handle biometric unlock failure', async () => {
    mockSelector.mockReturnValue({
      isLocked: true,
      lastActivity: Date.now(),
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);
    (biometricService.unlockApp as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useAppLock());

    let unlockResult: boolean;
    await act(async () => {
      unlockResult = await result.current.unlockWithBiometrics();
    });

    expect(unlockResult!).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalledWith(unlockApp());
  });

  it('should handle biometric unlock error', async () => {
    mockSelector.mockReturnValue({
      isLocked: true,
      lastActivity: Date.now(),
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);
    (biometricService.unlockApp as jest.Mock).mockRejectedValue(new Error('Biometric error'));

    const { result } = renderHook(() => useAppLock());

    let unlockResult: boolean;
    await act(async () => {
      unlockResult = await result.current.unlockWithBiometrics();
    });

    expect(unlockResult!).toBe(false);
  });

  it('should not run lock timeout when not authenticated', () => {
    mockSelector.mockReturnValue({
      isLocked: false,
      lastActivity: Date.now() - 15000, // 15 seconds ago
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
    } as any);

    renderHook(() => useAppLock());

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(lockApp());
  });

  it('should lock app after timeout when authenticated', () => {
    mockSelector.mockReturnValue({
      isLocked: false,
      lastActivity: Date.now() - 15000, // 15 seconds ago
      isOnline: true,
    });
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
    } as any);

    renderHook(() => useAppLock());

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(mockDispatch).toHaveBeenCalledWith(lockApp());
  });
});
