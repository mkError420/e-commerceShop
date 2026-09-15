import { apiClient } from "./api";
import { Category } from "../types";

export interface CategoryPayload {
  nameEn: string;
  nameBn?: string;
  slug?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  image?: string;
  isFeatured?: boolean;
  parentSlug?: string | null;
}

export const categoryService = {
  // Fetch all categories (hierarchical with subcategories)
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return apiClient<{ success: boolean; data: Category[] }>("/categories");
  },

  // Fetch single category by slug
  async getCategoryBySlug(slug: string): Promise<{ success: boolean; data: Category }> {
    return apiClient<{ success: boolean; data: Category }>(`/categories/${slug}`);
  },

  // Create top-level category
  async createCategory(payload: CategoryPayload): Promise<{ success: boolean; data: Category; message?: string }> {
    return apiClient<{ success: boolean; data: Category; message?: string }>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update top-level category
  async updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<{ success: boolean; data: Category; message?: string }> {
    return apiClient<{ success: boolean; data: Category; message?: string }>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Delete category
  async deleteCategory(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return apiClient<{ success: boolean; data?: any; message?: string }>(`/categories/${id}`, {
      method: "DELETE",
    });
  },

  // Create Subcategory under parent
  async createSubcategory(categoryId: string, payload: CategoryPayload): Promise<{ success: boolean; data: Category; message?: string }> {
    return apiClient<{ success: boolean; data: Category; message?: string }>(`/categories/${categoryId}/subcategories`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Update Subcategory
  async updateSubcategory(categoryId: string, subId: string, payload: Partial<CategoryPayload>): Promise<{ success: boolean; data: Category; message?: string }> {
    return apiClient<{ success: boolean; data: Category; message?: string }>(`/categories/${categoryId}/subcategories/${subId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Delete Subcategory
  async deleteSubcategory(categoryId: string, subId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return apiClient<{ success: boolean; data?: any; message?: string }>(`/categories/${categoryId}/subcategories/${subId}`, {
      method: "DELETE",
    });
  },
};
