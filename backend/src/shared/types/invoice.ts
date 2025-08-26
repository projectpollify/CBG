export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum ServiceType {
  RESURFACING = 'RESURFACING',
  NEW_BOARD = 'NEW_BOARD',
  STAINLESS_INSERT = 'STAINLESS_INSERT',
  STAINLESS_CLAMPS = 'STAINLESS_CLAMPS',
  BOARD_MODIFICATIONS = 'BOARD_MODIFICATIONS',
  SPECIAL = 'SPECIAL'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  E_TRANSFER = 'E_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT = 'DEBIT',
  OTHER = 'OTHER'
}

export interface ServicePricing {
  serviceType: ServiceType;
  unitPrice: number;
  description: string;
}

export interface InvoiceLineItem {
  id?: string;
  serviceType: ServiceType;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  regionId: string;
  customerId: string;
  invoiceDate: Date | string;
  dueDate: Date | string;
  paidDate?: Date | string | null;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  gstAmount: number;
  pstAmount: number;
  total: number;
  paymentMethod?: PaymentMethod | null;
  emailedAt?: Date | string | null;
  emailedTo?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  customer?: {
    id: string;
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export interface CreateInvoiceDTO {
  customerId: string;
  invoiceDate?: Date | string;
  dueDate?: Date | string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceDTO {
  customerId?: string;
  invoiceDate?: Date | string;
  dueDate?: Date | string;
  paidDate?: Date | string | null;
  status?: InvoiceStatus;
  lineItems?: InvoiceLineItem[];
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface InvoiceSettings {
  companyInfo: CompanyInfo;
  servicePricing: ServicePricing[];
  taxRates: TaxRates;
  invoiceDefaults: InvoiceDefaults;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  email: string;
  phone: string;
  website: string;
  gstNumber: string;
  logo?: string;
}

export interface TaxRates {
  gst: number;
  pst: number;
}

export interface InvoiceDefaults {
  nextInvoiceNumber: number;
  paymentTermsDays: number;
  defaultNotes?: string;
  emailSubject?: string;
  emailBody?: string;
}

export interface InvoiceFilter {
  status?: InvoiceStatus;
  customerId?: string;
  regionId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  revenueByService: Record<ServiceType, number>;
  revenueByMonth: Record<string, number>;
}

export interface EmailInvoiceRequest {
  invoiceId: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
  message?: string;
  attachPdf: boolean;
}

export interface BulkInvoiceAction {
  invoiceIds: string[];
  action: 'SEND' | 'MARK_PAID' | 'MARK_OVERDUE' | 'CANCEL';
  paymentMethod?: PaymentMethod;
  paidDate?: Date | string;
}

export const DEFAULT_SERVICE_PRICING: ServicePricing[] = [
  {
    serviceType: ServiceType.RESURFACING,
    unitPrice: 0.065,
    description: 'Board resurfacing service'
  },
  {
    serviceType: ServiceType.NEW_BOARD,
    unitPrice: 0.10,
    description: 'New cutting board sales'
  },
  {
    serviceType: ServiceType.STAINLESS_INSERT,
    unitPrice: 450.00,
    description: 'Stainless steel insert installation'
  },
  {
    serviceType: ServiceType.STAINLESS_CLAMPS,
    unitPrice: 25.00,
    description: 'Stainless steel clamps'
  },
  {
    serviceType: ServiceType.BOARD_MODIFICATIONS,
    unitPrice: 10.00,
    description: 'Board modifications and customization'
  },
  {
    serviceType: ServiceType.SPECIAL,
    unitPrice: 25.00,
    description: 'Special services'
  }
];

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Cutting Board Guys B.C inc.',
  address: '701 West Georgia suite 1400',
  city: 'Vancouver',
  province: 'B.C.',
  postalCode: 'V7Y1C6',
  email: 'info@cuttingboardguys.ca',
  phone: '604 468 8234',
  website: 'cuttingboardguys.ca',
  gstNumber: '756290169RT0001'
};

export const DEFAULT_TAX_RATES: TaxRates = {
  gst: 0.05,
  pst: 0.07
};

export const DEFAULT_INVOICE_SETTINGS: InvoiceDefaults = {
  nextInvoiceNumber: 10001,
  paymentTermsDays: 30,
  defaultNotes: 'Thank you for your business!',
  emailSubject: 'Invoice #{invoiceNumber} from Cutting Board Guys',
  emailBody: 'Please find attached your invoice. Payment is due within {paymentTerms} days.'
};