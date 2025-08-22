// Shared types for Cutting Board Guys platform
// Export all types to be used by frontend and backend

// Database model types (matching Prisma schema from Foundation Module)
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  region: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Customer {
  id: string;
  fullName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT';
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  amount: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate: Date;
  lineItems: any; // JSON field
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  customerId: string;
  customer?: Customer;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// New authentication types (Module 2)
export * from './types/auth';

// Common API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common enums
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
