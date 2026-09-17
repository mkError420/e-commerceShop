import { apiClient } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "ADMIN" | "CUSTOMER" | "MANAGER";
  createdAt?: string;
}

export interface ApiCustomerRecord {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
  totalOrders: number;
  totalSpentBDT: number;
  isBlocked: boolean;
  registeredDate: string;
}

export const authService = {
  // Login with phone or email and password
  async login(phoneOrEmail: string, password?: string): Promise<{ success: boolean; token: string; user: UserProfile; message?: string }> {
    const res = await apiClient<{ success: boolean; token: string; user: UserProfile; message?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier: phoneOrEmail, password }),
    });

    if (res.token) {
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_profile", JSON.stringify(res.user));
    }
    return res;
  },

  // Register Customer or Admin in MongoDB
  async register(
    name: string,
    phone: string,
    email?: string,
    password?: string,
    role: "ADMIN" | "CUSTOMER" | "MANAGER" = "CUSTOMER"
  ): Promise<{ success: boolean; token: string; user: UserProfile; message?: string }> {
    const res = await apiClient<{ success: boolean; token: string; user: UserProfile; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, email, password, role }),
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

  // Admin: Get all customers from database
  async getCustomers(): Promise<{ success: boolean; count: number; customers: ApiCustomerRecord[] }> {
    return apiClient<{ success: boolean; count: number; customers: ApiCustomerRecord[] }>("/auth/customers");
  },

  // Admin: Get all users from database
  async getUsers(): Promise<{ success: boolean; count: number; users: any[] }> {
    return apiClient<{ success: boolean; count: number; users: any[] }>("/auth/users");
  },

  // Admin: Update user / customer in database
  async updateUser(
    id: string,
    data: { name?: string; phone?: string; email?: string; role?: string; isBlocked?: boolean }
  ): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Admin: Delete user from database
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/users/${id}`, {
      method: "DELETE",
    });
  },

  // Logout
  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile");
  },
};
