// Customer status enum
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Base customer interface matching Prisma schema
export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  status: CustomerStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer creation data (for forms and API)
export interface CreateCustomerData {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  address: string;
  region: string;
  status?: CustomerStatus;
  notes?: string;
}

// Customer update data (partial updates)
export interface UpdateCustomerData {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  status?: CustomerStatus;
  notes?: string;
}

// Customer list filters
export interface CustomerFilters {
  region?: string;
  status?: CustomerStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Pagination metadata
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Customer list response
export interface CustomerListResponse {
  customers: Customer[];
  pagination: PaginationInfo;
}

// Customer statistics for dashboard
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  regionStats: RegionStat[];
  recentCustomers: RecentCustomer[];
}

// Region statistics
export interface RegionStat {
  region: string;
  count: number;
}

// Recent customer summary
export interface RecentCustomer {
  id: string;
  name: string;
  company: string;
  region: string;
  createdAt: Date;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Bulk update operation
export interface BulkUpdateRequest {
  updates: Array<{
    id: string;
    data: UpdateCustomerData;
  }>;
}

// Bulk update result
export interface BulkUpdateResult {
  successful: number;
  failed: number;
  total: number;
}

// Form validation errors
export interface CustomerFormErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  region?: string;
  notes?: string;
}

// Customer form state
export interface CustomerFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  status: CustomerStatus;
  notes: string;
}

// Search results
export interface CustomerSearchResult {
  customers: Customer[];
  totalResults: number;
  searchTerm: string;
}

// Import data structure (from JSON file)
export interface ImportCustomerData {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  id: string;
}

// Common BC regions for dropdown
export const BC_REGIONS = [
  'Vancouver',
  'North Vancouver',
  'West Vancouver',
  'Burnaby',
  'Richmond',
  'Surrey',
  'Langley',
  'Coquitlam',
  'Port Coquitlam',
  'New Westminster',
  'Delta',
  'White Rock',
  'Maple Ridge',
  'Port Moody',
  'Abbotsford',
  'Chilliwack',
  'Mission',
  'Victoria',
  'Nanaimo',
  'Kelowna',
  'Kamloops',
  'Vernon',
  'Whistler',
  'Squamish',
  'Lower Mainland',
  'Other'
] as const;

export type BCRegion = typeof BC_REGIONS[number];

// Customer status options for forms
export const CUSTOMER_STATUS_OPTIONS = [
  { value: CustomerStatus.ACTIVE, label: 'Active' },
  { value: CustomerStatus.INACTIVE, label: 'Inactive' }
] as const;
