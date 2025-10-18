import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import { AppDispatch } from '../store';
import { setOnlineStatus } from '../store/appSlice';

export const useNetworkStatus = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus(state.isConnected ?? false));
    });

    return () => unsubscribe();
  }, [dispatch]);
};
