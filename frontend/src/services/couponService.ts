import { apiClient } from "./api";
import { Coupon } from "../types";

export const couponService = {
  // Validate a coupon against cart subtotal
  async validateCoupon(
    code: string,
    cartTotal: number
  ): Promise<{
    success: boolean;
    coupon: Coupon;
    discountAmount: number;
    message: string;
  }> {
    return apiClient<{
      success: boolean;
      coupon: Coupon;
      discountAmount: number;
      message: string;
    }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, cartTotal }),
    });
  },

  // Admin: Get all coupons
  async getAllCoupons(): Promise<{ success: boolean; data: Coupon[] }> {
    return apiClient<{ success: boolean; data: Coupon[] }>("/coupons");
  },

  // Admin: Create coupon
  async createCoupon(couponData: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    return apiClient<{ success: boolean; data: Coupon }>("/coupons", {
      method: "POST",
      body: JSON.stringify(couponData),
    });
  },
};
