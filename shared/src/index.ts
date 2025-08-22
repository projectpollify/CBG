// Re-export all customer types
export * from './types/customer';

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

// Invoice types (for future Module 4)
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  gst: number;
  pst: number;
  total: number;
  items: InvoiceItem[];
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
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
