export declare enum CustomerStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
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
export interface CustomerFilters {
    region?: string;
    status?: CustomerStatus;
    search?: string;
    page?: number;
    limit?: number;
}
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}
export interface CustomerListResponse {
    customers: Customer[];
    pagination: PaginationInfo;
}
export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    regionStats: RegionStat[];
    recentCustomers: RecentCustomer[];
}
export interface RegionStat {
    region: string;
    count: number;
}
export interface RecentCustomer {
    id: string;
    name: string;
    company: string;
    region: string;
    createdAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface BulkUpdateRequest {
    updates: Array<{
        id: string;
        data: UpdateCustomerData;
    }>;
}
export interface BulkUpdateResult {
    successful: number;
    failed: number;
    total: number;
}
export interface CustomerFormErrors {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    region?: string;
    notes?: string;
}
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
export interface CustomerSearchResult {
    customers: Customer[];
    totalResults: number;
    searchTerm: string;
}
export interface ImportCustomerData {
    fullName: string;
    company: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    id: string;
}
export declare const BC_REGIONS: readonly ["Vancouver", "North Vancouver", "West Vancouver", "Burnaby", "Richmond", "Surrey", "Langley", "Coquitlam", "Port Coquitlam", "New Westminster", "Delta", "White Rock", "Maple Ridge", "Port Moody", "Abbotsford", "Chilliwack", "Mission", "Victoria", "Nanaimo", "Kelowna", "Kamloops", "Vernon", "Whistler", "Squamish", "Lower Mainland", "Other"];
export type BCRegion = typeof BC_REGIONS[number];
export declare const CUSTOMER_STATUS_OPTIONS: readonly [{
    readonly value: CustomerStatus.ACTIVE;
    readonly label: "Active";
}, {
    readonly value: CustomerStatus.INACTIVE;
    readonly label: "Inactive";
}];
//# sourceMappingURL=customer.d.ts.map