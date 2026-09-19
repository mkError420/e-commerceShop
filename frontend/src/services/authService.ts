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
  permissions?: string[];
  loyaltyTier?: string;
  loyaltyPoints?: number;
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
    role: "ADMIN" | "CUSTOMER" | "MANAGER" = "CUSTOMER",
    permissions?: string[]
  ): Promise<{ success: boolean; token: string; user: UserProfile; message?: string }> {
    const res = await apiClient<{ success: boolean; token: string; user: UserProfile; message?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, email, password, role, permissions }),
    });

    if (res.token) {
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_profile", JSON.stringify(res.user));
    }
    return res;
  },

  // Google OAuth Login
  async googleLogin(payload: { email: string; name: string; picture?: string; googleId?: string; credential?: string }): Promise<{ success: boolean; token: string; user: UserProfile; message?: string }> {
    const res = await apiClient<{ success: boolean; token: string; user: UserProfile; message?: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
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

  // Admin: Get all customers & users from database
  async getCustomers(): Promise<{ success: boolean; count: number; customers: ApiCustomerRecord[] }> {
    return apiClient<{ success: boolean; count: number; customers: ApiCustomerRecord[] }>("/auth/customers");
  },

  // Admin: Get all users from database
  async getUsers(): Promise<{ success: boolean; count: number; users: any[] }> {
    return apiClient<{ success: boolean; count: number; users: any[] }>("/auth/users");
  },

  // Admin: Update user / customer in database (Name, Phone, Email, Role, Permissions, Password, Status)
  async updateUser(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      role?: string;
      isBlocked?: boolean;
      permissions?: string[];
      password?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Admin: Promote customer/user to Shop Admin or Manager with custom permissions
  async promoteUserToAdmin(
    id: string,
    role: "ADMIN" | "MANAGER",
    permissions?: string[]
  ): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ role, permissions }),
    });
  },

  // Admin: Delete user from database
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/users/${id}`, {
      method: "DELETE",
    });
  },

  // ==========================================
  // SHOP ADMIN MANAGEMENT API
  // ==========================================

  // Get all shop administrators and managers
  async getShopAdmins(): Promise<{ success: boolean; count: number; admins: any[] }> {
    return apiClient<{ success: boolean; count: number; admins: any[] }>("/auth/admins");
  },

  // Create new shop administrator or manager
  async createShopAdmin(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role: "ADMIN" | "MANAGER";
    permissions?: string[];
  }): Promise<{ success: boolean; message: string; admin?: any }> {
    return apiClient<{ success: boolean; message: string; admin?: any }>("/auth/admins", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update existing shop administrator or manager
  async updateShopAdmin(
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      password?: string;
      role?: "ADMIN" | "MANAGER";
      permissions?: string[];
      isBlocked?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/admins/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete shop administrator
  async deleteShopAdmin(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/auth/admins/${id}`, {
      method: "DELETE",
    });
  },

  // Toggle active / blocked status
  async toggleShopAdminStatus(id: string): Promise<{ success: boolean; isBlocked: boolean; message: string }> {
    return apiClient<{ success: boolean; isBlocked: boolean; message: string }>(`/auth/admins/${id}/toggle-status`, {
      method: "PATCH",
    });
  },

  // Logout
  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile");
  },
};

