import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'react-native';
// **FIX**: Changed alias paths to relative paths
import { AppDispatch, RootState } from '../store';
import { lockApp, unlockApp, updateActivity } from '../store/appSlice';
import { biometricService } from '../services/biometric';
import { useAuth } from './useAuth';

const LOCK_TIMEOUT = 10000; // 10 seconds

export const useAppLock = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLocked, lastActivity } = useSelector((state: RootState) => state.app);
  const { isAuthenticated } = useAuth();

  // Update activity timestamp
  const updateActivityTime = useCallback(() => {
    dispatch(updateActivity());
  }, [dispatch]);

  // Lock the app
  const lock = useCallback(() => {
    dispatch(lockApp());
  }, [dispatch]);

  // Unlock the app
  const unlock = useCallback(() => {
    dispatch(unlockApp());
  }, [dispatch]);

  // Handle app state changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkLockTimeout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity >= LOCK_TIMEOUT && !isLocked) {
        lock();
      }
    };

    const interval = setInterval(checkLockTimeout, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, isLocked, lock]);

  // Handle app backgrounding
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        lock();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated, lock]);

  // Biometric unlock
  const unlockWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await biometricService.unlockApp();
      if (result) {
        unlock();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric unlock failed:', error);
      return false;
    }
  };

  return {
    isLocked,
    updateActivityTime,
    lock,
    unlock,
    unlockWithBiometrics,
  };
};
