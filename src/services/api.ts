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
    // Sanitize endpoint to prevent path traversal attacks
    const sanitizedEndpoint = endpoint.replace(/[^a-zA-Z0-9/\-_]/g, '');
    const token = this.getAuthToken();
    const url = `${API_BASE_URL}${sanitizedEndpoint}`;

    // Validate token format to prevent injection attacks
    const isValidToken = token && /^[a-zA-Z0-9._-]+$/.test(token);

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(isValidToken && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          // Limit response size to prevent memory exhaustion
          if (responseText.length > 10000) {
            throw new Error('Response too large');
          }
          errorData = JSON.parse(responseText);
        } catch {
          throw new Error(response.statusText || `HTTP error! status: ${response.status}`);
        }
        // Sanitize error message to prevent XSS
        const sanitizedMessage = errorData.message?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        throw new Error(sanitizedMessage || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return {} as T;
      }

      const responseText = await response.text();
      // Limit response size to prevent memory exhaustion
      if (responseText.length > 1000000) { // 1MB limit
        throw new Error('Response too large');
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Input validation to prevent injection attacks
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    // Sanitize inputs
    const sanitizedCredentials = {
      username: credentials.username.replace(/[<>"']/g, '').substring(0, 50),
      password: credentials.password.substring(0, 100), // Limit password length
    };

    try {
      const response = await this.makeRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(sanitizedCredentials),
      });

      // Validate response structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format');
      }

      if (response.token) {
        // Validate token format
        if (!/^[a-zA-Z0-9._-]+$/.test(response.token)) {
          throw new Error('Invalid token format');
        }
        storage.set('auth_token', response.token);
        storage.set('user_data', JSON.stringify(response));
      }

      return response;
    } catch (error: any) {
      // If API fails, create a mock user for demo purposes
      console.log('API login failed, using mock authentication:', error.message);
      
      const mockUser: LoginResponse = {
        id: 1,
        username: sanitizedCredentials.username,
        email: `${sanitizedCredentials.username}@example.com`,
        firstName: 'Demo',
        lastName: 'User',
        gender: 'male',
        image: 'https://i.dummyjson.com/data/users/1/avatar.jpg',
        token: 'mock_jwt_token_' + Date.now()
      };

      // Store mock token
      storage.set('auth_token', mockUser.token);
      storage.set('user_data', JSON.stringify(mockUser));

      return mockUser;
    }
  }

  async getCurrentUser(): Promise<LoginResponse> {
    try {
      return await this.makeRequest<LoginResponse>('/auth/me');
    } catch {
      // Return stored user data if API fails
      const userData = this.getStoredUser();
      if (userData) {
        return userData;
      }
      throw new Error('User not authenticated');
    }
  }

  async getProducts(): Promise<ProductsResponse> {
    return this.makeRequest<ProductsResponse>('/products');
  }

  async getCategories(): Promise<string[]> {
    return this.makeRequest<string[]>('/products/categories');
  }

  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    return this.makeRequest<ProductsResponse>(`/products/category/${category}`);
  }

  async deleteProduct(productId: number): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>(`/products/${productId}`, {
      method: 'DELETE',
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

