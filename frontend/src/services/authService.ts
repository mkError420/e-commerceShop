import { apiClient } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "ADMIN" | "CUSTOMER" | "MANAGER";
}

export const authService = {
  // Login with phone or email and password / OTP
  async login(phoneOrEmail: string, password?: string): Promise<{ success: boolean; token: string; user: UserProfile }> {
    const res = await apiClient<{ success: boolean; token: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: phoneOrEmail, password }),
    });

    if (res.token) {
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_profile", JSON.stringify(res.user));
    }
    return res;
  },

  // Register
  async register(name: string, phone: string, email?: string): Promise<{ success: boolean; token: string; user: UserProfile }> {
    const res = await apiClient<{ success: boolean; token: string; user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, email }),
    });

    if (res.token) {
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_profile", JSON.stringify(res.user));
    }
    return res;
  },

  // Current user profile
  async getCurrentUser(): Promise<{ success: boolean; user: UserProfile }> {
    return apiClient<{ success: boolean; user: UserProfile }>("/auth/me");
  },

  // Logout
  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile");
  },
};
