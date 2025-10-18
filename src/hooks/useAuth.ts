import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// **FIX**: Changed alias paths to relative paths
import { AppDispatch, RootState } from '../store';
import { loginUser, restoreSession, logout } from '../store/authSlice';
import { LoginRequest } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Try to restore session on app start
    dispatch(restoreSession());
  }, [dispatch]);

  const login = async (credentials: LoginRequest) => {
    return dispatch(loginUser(credentials));
  };

  const signOut = () => {
    dispatch(logout());
  };

  const isSuperAdmin = () => {
    return user?.username === 'superadmin';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signOut,
    isSuperAdmin,
  };
};
