import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NavigationContainer } from '@react-navigation/native';
import { store } from '@/store';
import App from '../../App';
import { apiService } from '@/services/api';
import { biometricService } from '@/services/biometric';

// Mock all external dependencies
jest.mock('@/services/api');
jest.mock('@/services/biometric');
jest.mock('react-native-mmkv');
jest.mock('react-native-biometrics');
jest.mock('react-native-keychain');
jest.mock('@react-native-community/netinfo');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const mockedApiService = apiService as jest.Mocked<typeof apiService>;
const mockedBiometricService = biometricService as jest.Mocked<typeof biometricService>;

describe('App Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderApp = () => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </QueryClientProvider>
      </Provider>
    );
  };

  describe('Authentication Flow', () => {
    it('should show login screen when not authenticated', () => {
      mockedApiService.isAuthenticated.mockReturnValue(false);
      mockedApiService.getStoredUser.mockReturnValue(null);

      renderApp();

      expect(screen.getByText('Store App')).toBeTruthy();
      expect(screen.getByText('Welcome back! Please sign in')).toBeTruthy();
    });

    it('should handle successful login', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      };

      mockedApiService.login.mockResolvedValue(mockUser);
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue(mockUser);

      renderApp();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByText('Sign In');

      fireEvent.changeText(usernameInput, 'testuser');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockedApiService.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should handle login failure', async () => {
      mockedApiService.login.mockRejectedValue(new Error('Invalid credentials'));

      renderApp();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const loginButton = screen.getByText('Sign In');

      fireEvent.changeText(usernameInput, 'invalid');
      fireEvent.changeText(passwordInput, 'wrong');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockedApiService.login).toHaveBeenCalledWith({
          username: 'invalid',
          password: 'wrong',
        });
      });
    });
  });

  describe('Biometric Authentication', () => {
    it('should show biometric unlock when app is locked', async () => {
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      });

      mockedBiometricService.unlockApp.mockResolvedValue(true);

      renderApp();

      // Simulate app lock
      const { lockApp } = require('@/store/appSlice');
      store.dispatch(lockApp());

      await waitFor(() => {
        expect(screen.getByText('App Locked')).toBeTruthy();
        expect(screen.getByText('Use biometrics or password to unlock')).toBeTruthy();
      });
    });

    it('should handle biometric unlock success', async () => {
      mockedBiometricService.unlockApp.mockResolvedValue(true);

      renderApp();

      const unlockButton = screen.getByText('Unlock');
      fireEvent.press(unlockButton);

      await waitFor(() => {
        expect(mockedBiometricService.unlockApp).toHaveBeenCalled();
      });
    });

    it('should handle biometric unlock failure', async () => {
      mockedBiometricService.unlockApp.mockResolvedValue(false);

      renderApp();

      const unlockButton = screen.getByText('Unlock');
      fireEvent.press(unlockButton);

      await waitFor(() => {
        expect(mockedBiometricService.unlockApp).toHaveBeenCalled();
      });
    });
  });

  describe('Product Management', () => {
    beforeEach(() => {
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue({
        id: 1,
        username: 'superadmin',
        email: 'admin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      });
    });

    it('should load products successfully', async () => {
      const mockProducts = {
        products: [
          {
            id: 1,
            title: 'Test Product',
            price: 100,
            thumbnail: 'test.jpg',
            brand: 'Test Brand',
            category: 'electronics',
            rating: 4.5,
            stock: 10,
            discountPercentage: 0,
            description: 'Test description',
            images: ['test.jpg'],
          },
        ],
        total: 1,
        skip: 0,
        limit: 30,
      };

      mockedApiService.getProducts.mockResolvedValue(mockProducts);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('All Products')).toBeTruthy();
      });
    });

    it('should handle product deletion for superadmin', async () => {
      const mockProducts = {
        products: [
          {
            id: 1,
            title: 'Test Product',
            price: 100,
            thumbnail: 'test.jpg',
            brand: 'Test Brand',
            category: 'electronics',
            rating: 4.5,
            stock: 10,
            discountPercentage: 0,
            description: 'Test description',
            images: ['test.jpg'],
          },
        ],
        total: 1,
        skip: 0,
        limit: 30,
      };

      mockedApiService.getProducts.mockResolvedValue(mockProducts);
      mockedApiService.deleteProduct.mockResolvedValue({
        id: 1,
        title: 'Test Product',
        isDeleted: true,
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Admin Mode - Delete enabled')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      });
    });

    it('should navigate to category screen', async () => {
      const mockProducts = {
        products: [],
        total: 0,
        skip: 0,
        limit: 30,
      };

      const mockCategories = ['smartphones', 'laptops', 'fragrances'];

      mockedApiService.getProducts.mockResolvedValue(mockProducts);
      mockedApiService.getCategories.mockResolvedValue(mockCategories);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('All Products')).toBeTruthy();
      });

      // Navigate to category
      const categoryButton = screen.getByTestId('category-button');
      fireEvent.press(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('smartphones')).toBeTruthy();
      });
    });
  });

  describe('Offline Support', () => {
    it('should show offline banner when disconnected', async () => {
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      });

      // Simulate offline state
      const { setOnlineStatus } = require('@/store/appSlice');
      store.dispatch(setOnlineStatus(false));

      renderApp();

      await waitFor(() => {
        expect(screen.getByText("You're offline. Some features may be limited.")).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      });

      mockedApiService.getProducts.mockRejectedValue(new Error('Network error'));

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('No Products Found')).toBeTruthy();
      });
    });

    it('should handle biometric errors gracefully', async () => {
      mockedApiService.isAuthenticated.mockReturnValue(true);
      mockedApiService.getStoredUser.mockReturnValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'mock-token',
      });

      mockedBiometricService.unlockApp.mockRejectedValue(new Error('Biometric error'));

      renderApp();

      // Simulate app lock
      const { lockApp } = require('@/store/appSlice');
      store.dispatch(lockApp());

      await waitFor(() => {
        expect(screen.getByText('App Locked')).toBeTruthy();
      });
    });
  });
});
