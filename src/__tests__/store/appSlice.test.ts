import appReducer, { lockApp, unlockApp, updateActivity, setOnlineStatus, resetApp } from '../../store/appSlice';

describe('appSlice', () => {
  const initialState = {
    isLocked: false,
    lastActivity: Date.now(),
    isOnline: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle lockApp', () => {
      const newState = appReducer(initialState, lockApp());

      expect(newState.isLocked).toBe(true);
    });

    it('should handle unlockApp', () => {
      const state = {
        ...initialState,
        isLocked: true,
      };

      const newState = appReducer(state, unlockApp());

      expect(newState.isLocked).toBe(false);
      expect(newState.lastActivity).toBeGreaterThan(initialState.lastActivity);
    });

    it('should handle updateActivity', () => {
      const newState = appReducer(initialState, updateActivity());

      expect(newState.lastActivity).toBeGreaterThan(initialState.lastActivity);
    });

    it('should handle setOnlineStatus', () => {
      const newState = appReducer(initialState, setOnlineStatus(false));

      expect(newState.isOnline).toBe(false);
    });

    it('should handle resetApp', () => {
      const state = {
        ...initialState,
        isLocked: true,
      };

      const newState = appReducer(state, resetApp());

      expect(newState.isLocked).toBe(false);
      expect(newState.lastActivity).toBeGreaterThan(initialState.lastActivity);
    });
  });
});
