import { apiService } from '@/services/api';
import { MMKV } from 'react-native-mmkv';

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockedMMKV = MMKV as jest.MockedClass<typeof MMKV>;

describe('API Security Tests', () => {
  let mockStorage: jest.Mocked<MMKV>;

  beforeEach(() => {
    mockStorage = {
      set: jest.fn(),
      getString: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockedMMKV.mockImplementation(() => mockStorage);
    jest.clearAllMocks();
  });

  describe('Authentication Security', () => {
    it('should store tokens securely', async () => {
      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'secure-jwt-token',
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await apiService.login({ username: 'testuser', password: 'password123' });

      expect(mockStorage.set).toHaveBeenCalledWith('auth_token', 'secure-jwt-token');
      expect(mockStorage.set).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse));
    });

    it('should handle authentication errors securely', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(apiService.login({ username: 'invalid', password: 'wrong' }))
        .rejects.toThrow('HTTP error! status: 401');

      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it('should validate tokens on API calls', async () => {
      mockStorage.getString.mockReturnValue('valid-token');

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, username: 'testuser' }),
      } as Response);

      await apiService.getCurrentUser();

      expect(mockedFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('should handle token validation failure', async () => {
      mockStorage.getString.mockReturnValue('invalid-token');

      mockedFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(apiService.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('Data Security', () => {
    it('should sanitize input parameters', async () => {
      mockStorage.getString.mockReturnValue('valid-token');

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] }),
      } as Response);

      // Test with potentially malicious category name
      const maliciousCategory = '../../../etc/passwd';
      await apiService.getProductsByCategory(maliciousCategory);

      expect(mockedFetch).toHaveBeenCalledWith(
        `https://dummyjson.com/products/category/${encodeURIComponent(maliciousCategory)}`,
        expect.any(Object)
      );
    });

    it('should handle network errors gracefully', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getProducts()).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      mockStorage.getString.mockReturnValue('valid-token');

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      await expect(apiService.getProducts()).rejects.toThrow();
    });
  });

  describe('Session Management', () => {
    it('should clear sensitive data on logout', () => {
      apiService.logout();

      expect(mockStorage.delete).toHaveBeenCalledWith('auth_token');
      expect(mockStorage.delete).toHaveBeenCalledWith('user_data');
    });

    it('should check authentication status correctly', () => {
      mockStorage.getString.mockReturnValue('valid-token');
      expect(apiService.isAuthenticated()).toBe(true);

      mockStorage.getString.mockReturnValue(null);
      expect(apiService.isAuthenticated()).toBe(false);
    });

    it('should retrieve stored user data securely', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'image.jpg',
        token: 'stored-token',
      };

      mockStorage.getString.mockReturnValue(JSON.stringify(mockUser));

      const storedUser = apiService.getStoredUser();

      expect(storedUser).toEqual(mockUser);
    });

    it('should handle corrupted stored data', () => {
      mockStorage.getString.mockReturnValue('invalid-json');

      const storedUser = apiService.getStoredUser();

      expect(storedUser).toBeNull();
    });
  });

  describe('Request Security', () => {
    it('should set proper headers', async () => {
      mockStorage.getString.mockReturnValue('valid-token');

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] }),
      } as Response);

      await apiService.getProducts();

      expect(mockedFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('should handle missing tokens gracefully', async () => {
      mockStorage.getString.mockReturnValue(null);

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [] }),
      } as Response);

      await apiService.getProducts();

      expect(mockedFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
