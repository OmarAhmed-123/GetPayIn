import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// **FIX**: Changed alias path to relative path
import { AppState } from '../types';

const initialState: AppState = {
  isLocked: false,
  lastActivity: Date.now(),
  isOnline: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    lockApp: (state) => {
      state.isLocked = true;
    },
    unlockApp: (state) => {
      state.isLocked = false;
      state.lastActivity = Date.now();
    },
    updateActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    resetApp: (state) => {
      state.isLocked = false;
      state.lastActivity = Date.now();
    },
  },
});

export const { lockApp, unlockApp, updateActivity, setOnlineStatus, resetApp } = appSlice.actions;
export default appSlice.reducer;
