// Authentication types for Cutting Board Guys platform
// Shared between frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export interface AuthError {
  success: false;
  message: string;
  field?: string; // Which field caused the error (email/password)
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// JWT payload structure
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

// API response wrapper
export type AuthResponse = LoginResponse | AuthError;
