// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_URL}/api/auth/login`,
  logout: `${API_URL}/api/auth/logout`,
  
  // Customers
  customers: `${API_URL}/api/customers`,
  
  // Invoices  
  invoices: `${API_URL}/api/invoices`,
  
  // Appointments
  appointments: `${API_URL}/api/appointments`,
  
  // Settings
  settings: `${API_URL}/api/settings`,
  companyInfo: `${API_URL}/api/settings/company`,
  servicePricing: `${API_URL}/api/settings/pricing`,
  
  // Reports
  reports: `${API_URL}/api/reports`,
  salesReport: `${API_URL}/api/reports/sales`,
  
  // Health
  health: `${API_URL}/api/health`,
  testDb: `${API_URL}/api/test-db`
};