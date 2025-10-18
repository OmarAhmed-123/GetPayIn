import React, { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store';
import { queryClient, restoreQueryClient } from './src/utils/queryClient';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import LockScreen from './src/components/LockScreen';
import SplashScreen from './src/components/SplashScreen';
import { RootState } from './src/store';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';

const AppContent: React.FC = () => {
  const { isLocked } = useSelector((state: RootState) => state.app);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);

  // Monitor network status
  useNetworkStatus();

  // Restore cached queries on app start
  useEffect(() => {
    restoreQueryClient();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setSplashFinished(true);
  };

  if (showSplash) {
    return <SplashScreen onAnimationFinish={handleSplashFinish} />;
  }

  // Always show login screen after splash, regardless of authentication state
  if (splashFinished && !isAuthenticated) {
    return <AppNavigator />;
  }

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
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;