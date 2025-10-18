import { MMKV } from 'react-native-mmkv';
// **FIX**: Changed alias path to relative path
import { LoginRequest, LoginResponse, ProductsResponse, DeleteResponse } from '../types';

const storage = new MMKV();

const API_BASE_URL = 'https://dummyjson.com';

class ApiService {
  private getAuthToken(): string | null {
    return storage.getString('auth_token') || null;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // DummyJSON doesn't have a real auth endpoint, so we'll simulate login
    // In a real app, you would use a proper authentication service
    
    // For demo purposes, we'll create a mock user response
    const mockUser: LoginResponse = {
      id: 1,
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      image: 'https://i.dummyjson.com/data/users/1/avatar.jpg',
      token: 'mock_jwt_token_' + Date.now()
    };

    // Store token for future requests
    if (mockUser.token) {
      storage.set('auth_token', mockUser.token);
      storage.set('user_data', JSON.stringify(mockUser));
    }

    return mockUser;
  }

  async getCurrentUser(): Promise<LoginResponse> {
    // Return stored user data or throw error if not authenticated
    const userData = this.getStoredUser();
    if (!userData) {
      throw new Error('User not authenticated');
    }
    return userData;
  }

  async getProducts(): Promise<ProductsResponse> {
    return this.makeRequest<ProductsResponse>('/products');
  }

  // Note: The API actually returns an array of strings directly, not an object.
  async getCategories(): Promise<string[]> {
    return this.makeRequest<string[]>('/products/categories');
  }

  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    return this.makeRequest<ProductsResponse>(`/products/category/${category}`);
  }

  async deleteProduct(productId: number): Promise<DeleteResponse> {
    // DummyJSON doesn't support DELETE operations, so we'll simulate it
    // In a real app, you would make an actual DELETE request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: productId,
          title: 'Deleted Product',
          isDeleted: true
        });
      }, 500); // Simulate network delay
    });
  }

  logout(): void {
    storage.delete('auth_token');
    storage.delete('user_data');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getStoredUser(): LoginResponse | null {
    const userData = storage.getString('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

export const apiService = new ApiService();
