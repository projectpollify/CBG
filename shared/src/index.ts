// ========================================
// Cutting Board Guys - Shared Type Definitions
// ========================================

// ========== USER TYPES ==========
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  regionId: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  FRANCHISEE = 'FRANCHISEE',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ========== CUSTOMER TYPES ==========
export interface Customer {
  id: string;
  regionId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string | null;
  status: CustomerStatus;
  lastContactDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT'
}

export interface CreateCustomerRequest {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province?: string;
  postalCode: string;
  notes?: string;
}

// ========== INVOICE TYPES ==========
export interface Invoice {
  id: string;
  invoiceNumber: number;
  regionId: string;
  customerId: string;
  customer?: Customer;
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date | null;
  status: InvoiceStatus;
  lineItems: LineItem[];
  subtotal: number;
  gstAmount: number;
  pstAmount: number;
  total: number;
  paymentMethod?: string | null;
  emailedAt?: Date | null;
  emailedTo?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface LineItem {
  id?: string;
  description: string;
  category: LineItemCategory;
  quantity: number;
  unitPrice: number;
  squareInches?: number;
  total: number;
}

export enum LineItemCategory {
  RESURFACING = 'resurfacing',
  NEW_BOARDS = 'new_boards',
  MODIFICATIONS = 'modifications',
  STAINLESS_INSERT = 'stainless_insert',
  STAINLESS_CLAMPS = 'stainless_clamps',
  SPECIAL = 'special'
}

export interface CreateInvoiceRequest {
  customerId: string;
  lineItems: LineItem[];
  notes?: string;
  dueDate?: Date;
}

// ========== APPOINTMENT TYPES ==========
export interface Appointment {
  id: string;
  regionId: string;
  title: string;
  description?: string | null;
  type: AppointmentType;
  status: AppointmentStatus;
  customerId?: string | null;
  customer?: Customer | null;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  SERVICE = 'SERVICE',
  MEETING = 'MEETING',
  TASK = 'TASK',
  OTHER = 'OTHER'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// ========== SETTINGS TYPES ==========
export interface Settings {
  id: string;
  category: SettingsCategory;
  key: string;
  value: any;
  regionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum SettingsCategory {
  BUSINESS = 'business',
  INVOICE = 'invoice',
  PRICING = 'pricing'
}

export interface PricingSettings {
  resurfacing: number;      // per square inch
  new_boards: number;        // per square inch  
  modifications: number;     // flat rate
  stainless_insert: number;  // flat rate
  stainless_clamps: number;  // flat rate
  special: number;          // flat rate
}

export interface BusinessSettings {
  name: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  gstNumber: string;
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// ========== COMMON TYPES ==========
export interface Region {
  id: string;
  name: string;
  code: string;
}

// Common regions for Cutting Board Guys
export const REGIONS: Region[] = [
  { id: 'vancouver', name: 'Vancouver', code: 'VAN' },
  { id: 'victoria', name: 'Victoria', code: 'VIC' },
  { id: 'kelowna', name: 'Kelowna', code: 'KEL' },
  { id: 'calgary', name: 'Calgary', code: 'CAL' }
];

// ========== HELPER FUNCTIONS ==========
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD'
  }).format(amount);
};

export const formatInvoiceNumber = (num: number): string => {
  return num.toString().padStart(5, '0');
};

export const calculateInvoiceTotals = (lineItems: LineItem[]) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = subtotal * 0.05;
  const pstAmount = subtotal * 0.07;
  const total = subtotal + gstAmount + pstAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    pstAmount: Math.round(pstAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};
