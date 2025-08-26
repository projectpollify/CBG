export * from './types/customer';
export * from './types/invoice';
export * from './types/auth';
export * from './utils/invoiceCalculations';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    FRANCHISEE = "FRANCHISEE",
    EMPLOYEE = "EMPLOYEE"
}
export interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
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
export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface Settings {
    id: string;
    key: string;
    value: string;
    category: SettingsCategory;
    updatedAt: Date;
}
export declare enum SettingsCategory {
    BUSINESS = "BUSINESS",
    INVOICE = "INVOICE",
    EMAIL = "EMAIL",
    SYSTEM = "SYSTEM"
}
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
export interface ValidationError {
    field: string;
    message: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: string;
}
export type ID = string;
export type Timestamp = Date;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;
//# sourceMappingURL=index.d.ts.map