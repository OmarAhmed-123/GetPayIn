import { apiService } from '../../services/api';
import { MMKV } from 'react-native-mmkv';

// Mock MMKV
const mockMMKV = {
  getString: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => mockMMKV),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const credentials = { username: 'testuser', password: 'password123' };
      const result = await apiService.login(credentials);

      expect(result).toEqual(mockResponse);
      expect(mockMMKV.set).toHaveBeenCalledWith('auth_token', mockResponse.token);
      expect(mockMMKV.set).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse));
    });

    it('should fallback to mock user when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const credentials = { username: 'testuser', password: 'password123' };
      const result = await apiService.login(credentials);

      expect(result.username).toBe('testuser');
      expect(result.token).toContain('mock_jwt_token_');
      expect(mockMMKV.set).toHaveBeenCalledWith('auth_token', expect.any(String));
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from API', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      });

      const result = await apiService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return stored user when API fails', async () => {
      const mockStoredUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      mockMMKV.getString.mockReturnValue(JSON.stringify(mockStoredUser));

      const result = await apiService.getCurrentUser();

      expect(result).toEqual(mockStoredUser);
    });
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = {
        products: [
          {
            id: 1,
            title: 'Test Product',
            description: 'Test Description',
            price: 100,
            discountPercentage: 10,
            rating: 4.5,
            stock: 50,
            brand: 'Test Brand',
            category: 'electronics',
            thumbnail: 'https://example.com/thumb.jpg',
            images: ['https://example.com/img1.jpg'],
          },
        ],
        total: 1,
        skip: 0,
        limit: 30,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      });

      const result = await apiService.getProducts();

      expect(result).toEqual(mockProducts);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = ['electronics', 'clothing', 'books'];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories),
      });

      const result = await apiService.getCategories();

      expect(result).toEqual(mockCategories);
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by category successfully', async () => {
      const mockProducts = {
        products: [],
        total: 0,
        skip: 0,
        limit: 30,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      });

      const result = await apiService.getProductsByCategory('electronics');

      expect(result).toEqual(mockProducts);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/electronics',
        expect.any(Object)
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockResponse = {
        id: 1,
        title: 'Deleted Product',
        isDeleted: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.deleteProduct(1);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('logout', () => {
    it('should clear stored data on logout', () => {
      apiService.logout();

      expect(mockMMKV.delete).toHaveBeenCalledWith('auth_token');
      expect(mockMMKV.delete).toHaveBeenCalledWith('user_data');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockMMKV.getString.mockReturnValue('mock_token_123');

      const result = apiService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      mockMMKV.getString.mockReturnValue(null);

      const result = apiService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('should return stored user data', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        image: 'https://example.com/avatar.jpg',
        token: 'mock_token_123',
      };

      mockMMKV.getString.mockReturnValue(JSON.stringify(mockUser));

      const result = apiService.getStoredUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no stored user', () => {
      mockMMKV.getString.mockReturnValue(null);

      const result = apiService.getStoredUser();

      expect(result).toBeNull();
    });
  });
});
