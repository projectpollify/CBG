// Re-export all customer types
export * from './types/customer';

// Re-export all invoice types
export * from './types/invoice';

// Re-export all auth types
export * from './types/auth';

// Re-export invoice utilities
export * from './utils/invoiceCalculations';

// Base user types (from Foundation Module)
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  FRANCHISEE = 'FRANCHISEE',
  EMPLOYEE = 'EMPLOYEE'
}

// Session types (from Foundation Module)
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Appointment types (for future Module 6)
export interface Appointment {
  id: string;
  customerId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Settings types (for future Module 5)
export interface Settings {
  id: string;
  key: string;
  value: string;
  category: SettingsCategory;
  updatedAt: Date;
}

export enum SettingsCategory {
  BUSINESS = 'BUSINESS',
  INVOICE = 'INVOICE',
  EMAIL = 'EMAIL',
  SYSTEM = 'SYSTEM'
}

// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

// Common utility types
export type ID = string;
export type Timestamp = Date;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;
