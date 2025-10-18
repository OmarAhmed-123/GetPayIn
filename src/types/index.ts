export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// Note: The API actually returns an array of strings directly for categories.
// This type is adjusted for correctness based on the API service code.
export type CategoriesResponse = string[];


export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

export interface DeleteResponse {
  id: number;
  title: string;
  isDeleted: boolean;
}

export interface AppState {
  isLocked: boolean;
  lastActivity: number;
  isOnline: boolean;
}

export interface RootState {
  auth: AuthState;
  app: AppState;
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Category: { category: string };
};

export type MainTabParamList = {
  Products: undefined;
  SignOut: undefined;
};
