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
    field?: string;
}
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export type AuthResponse = LoginResponse | AuthError;
//# sourceMappingURL=auth.d.ts.map