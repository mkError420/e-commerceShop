import { apiClient } from "./api";
import { HeroBanner } from "../types";

export const bannerService = {
  // Get all banners
  async getBanners(activeOnly: boolean = false): Promise<{ success: boolean; count: number; data: HeroBanner[] }> {
    const query = activeOnly ? "?activeOnly=true" : "";
    return apiClient<{ success: boolean; count: number; data: HeroBanner[] }>(`/banners${query}`);
  },

  // Get single banner by ID
  async getBannerById(id: string): Promise<{ success: boolean; data: HeroBanner }> {
    return apiClient<{ success: boolean; data: HeroBanner }>(`/banners/${id}`);
  },

  // Create new banner
  async createBanner(
    data: Omit<HeroBanner, "id" | "createdAt">
  ): Promise<{ success: boolean; message: string; data?: HeroBanner }> {
    return apiClient<{ success: boolean; message: string; data?: HeroBanner }>("/banners", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update existing banner
  async updateBanner(
    id: string,
    data: Partial<HeroBanner>
  ): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete banner
  async deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/banners/${id}`, {
      method: "DELETE",
    });
  },

  // Toggle active/inactive status
  async toggleBannerStatus(id: string): Promise<{ success: boolean; isActive: boolean; message: string }> {
    return apiClient<{ success: boolean; isActive: boolean; message: string }>(`/banners/${id}/toggle`, {
      method: "PATCH",
    });
  },
};
