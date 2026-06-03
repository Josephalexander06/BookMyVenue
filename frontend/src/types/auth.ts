export type UserRole = "customer" | "owner" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export interface SendOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  user: AuthUser;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
}
