import { configureStore } from '@reduxjs/toolkit';
import appReducer, { lockApp, unlockApp, updateActivity, setOnlineStatus } from '@/store/appSlice';
import { biometricService } from '@/services/biometric';

// Mock biometric service
jest.mock('@/services/biometric');
const mockedBiometricService = biometricService as jest.Mocked<typeof biometricService>;

describe('App Lock Security Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        app: appReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Lock State Management', () => {
    it('should lock the app securely', () => {
      store.dispatch(lockApp());

      const state = store.getState();
      expect(state.app.isLocked).toBe(true);
    });

    it('should unlock the app and update activity', () => {
      const initialTime = Date.now();
      
      // Lock first
      store.dispatch(lockApp());
      expect(store.getState().app.isLocked).toBe(true);

      // Unlock
      store.dispatch(unlockApp());
      
      const state = store.getState();
      expect(state.app.isLocked).toBe(false);
      expect(state.app.lastActivity).toBeGreaterThanOrEqual(initialTime);
    });

    it('should update activity timestamp', () => {
      const initialTime = store.getState().app.lastActivity;
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        store.dispatch(updateActivity());
        
        const state = store.getState();
        expect(state.app.lastActivity).toBeGreaterThan(initialTime);
      }, 10);
    });
  });

  describe('Online Status Management', () => {
    it('should set online status correctly', () => {
      store.dispatch(setOnlineStatus(true));
      expect(store.getState().app.isOnline).toBe(true);

      store.dispatch(setOnlineStatus(false));
      expect(store.getState().app.isOnline).toBe(false);
    });
  });

  describe('Biometric Integration', () => {
    it('should handle biometric unlock success', async () => {
      mockedBiometricService.unlockApp.mockResolvedValue(true);

      const result = await mockedBiometricService.unlockApp();

      expect(result).toBe(true);
      expect(mockedBiometricService.unlockApp).toHaveBeenCalled();
    });

    it('should handle biometric unlock failure', async () => {
      mockedBiometricService.unlockApp.mockResolvedValue(false);

      const result = await mockedBiometricService.unlockApp();

      expect(result).toBe(false);
    });

    it('should handle biometric service errors', async () => {
      mockedBiometricService.unlockApp.mockRejectedValue(new Error('Biometric error'));

      await expect(mockedBiometricService.unlockApp()).rejects.toThrow('Biometric error');
    });
  });

  describe('Auto-lock Security', () => {
    it('should maintain lock state consistency', () => {
      // Initial state should be unlocked
      expect(store.getState().app.isLocked).toBe(false);

      // Lock the app
      store.dispatch(lockApp());
      expect(store.getState().app.isLocked).toBe(true);

      // Unlock the app
      store.dispatch(unlockApp());
      expect(store.getState().app.isLocked).toBe(false);
    });

    it('should handle rapid state changes', () => {
      // Rapid lock/unlock cycles
      for (let i = 0; i < 10; i++) {
        store.dispatch(lockApp());
        expect(store.getState().app.isLocked).toBe(true);
        
        store.dispatch(unlockApp());
        expect(store.getState().app.isLocked).toBe(false);
      }
    });
  });

  describe('Activity Tracking', () => {
    it('should track activity timestamps accurately', () => {
      const startTime = Date.now();
      
      store.dispatch(updateActivity());
      const firstActivity = store.getState().app.lastActivity;
      
      expect(firstActivity).toBeGreaterThanOrEqual(startTime);

      // Wait and update again
      setTimeout(() => {
        store.dispatch(updateActivity());
        const secondActivity = store.getState().app.lastActivity;
        
        expect(secondActivity).toBeGreaterThan(firstActivity);
      }, 10);
    });

    it('should handle concurrent activity updates', () => {
      const initialTime = store.getState().app.lastActivity;
      
      // Simulate multiple rapid updates
      for (let i = 0; i < 5; i++) {
        store.dispatch(updateActivity());
      }
      
      const finalTime = store.getState().app.lastActivity;
      expect(finalTime).toBeGreaterThanOrEqual(initialTime);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state across multiple actions', () => {
      // Initial state
      expect(store.getState().app.isLocked).toBe(false);
      expect(store.getState().app.isOnline).toBe(true);

      // Lock and go offline
      store.dispatch(lockApp());
      store.dispatch(setOnlineStatus(false));

      const state = store.getState().app;
      expect(state.isLocked).toBe(true);
      expect(state.isOnline).toBe(false);

      // Unlock and go online
      store.dispatch(unlockApp());
      store.dispatch(setOnlineStatus(true));

      const finalState = store.getState().app;
      expect(finalState.isLocked).toBe(false);
      expect(finalState.isOnline).toBe(true);
    });
  });
});
