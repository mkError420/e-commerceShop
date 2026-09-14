import { apiClient } from "./api";
import { Product, Category } from "../types";

export const productService = {
  // Fetch all products with optional filters
  async getProducts(params?: {
    category?: string;
    subCategory?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<{ success: boolean; data: Product[]; total: number }> {
    return apiClient<{ success: boolean; data: Product[]; total: number }>("/products", {
      params,
    });
  },

  // Fetch single product by slug
  async getProductBySlug(slug: string): Promise<{ success: boolean; data: Product }> {
    return apiClient<{ success: boolean; data: Product }>(`/products/${slug}`);
  },

  // Fetch all categories tree
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return apiClient<{ success: boolean; data: Category[] }>("/categories");
  },

  // Admin: Create product
  async createProduct(product: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return apiClient<{ success: boolean; data: Product }>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },

  // Admin: Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return apiClient<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  // Admin: Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
  },
};
