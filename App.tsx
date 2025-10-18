import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { queryClient, restoreQueryClient } from '@/utils/queryClient';
import AppNavigator from '@/navigation/AppNavigator';
import LockScreen from '@/components/LockScreen';
import { RootState } from '@/store';

const AppContent: React.FC = () => {
  const { isLocked } = useSelector((state: RootState) => state.app);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Restore cached queries on app start
  useEffect(() => {
    restoreQueryClient();
  }, []);

  return (
    <>
      <AppNavigator />
      {isAuthenticated && <LockScreen visible={isLocked} />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;