import { apiClient } from "./api";
import { Order } from "../types";

export const orderService = {
  // Create a new order (COD, bKash, Nagad, SSLCommerz)
  async createOrder(orderPayload: Partial<Order>): Promise<{ success: boolean; data: Order; paymentUrl?: string }> {
    return apiClient<{ success: boolean; data: Order; paymentUrl?: string }>("/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    });
  },

  // Get order details by ID
  async getOrderById(orderId: string): Promise<{ success: boolean; data: Order }> {
    return apiClient<{ success: boolean; data: Order }>(`/orders/${orderId}`);
  },

  // Track order by tracking number or mobile phone
  async trackOrder(query: { trackingNumber?: string; phone?: string }): Promise<{ success: boolean; data: Order[] }> {
    return apiClient<{ success: boolean; data: Order[] }>("/orders/track", {
      params: query,
    });
  },

  // Admin: List all orders with filters
  async getAllOrders(params?: { status?: string; paymentStatus?: string; page?: number }): Promise<{
    success: boolean;
    data: Order[];
    total: number;
  }> {
    return apiClient<{ success: boolean; data: Order[]; total: number }>("/orders", {
      params,
    });
  },

  // Admin: Update order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  async updateOrderStatus(
    orderId: string,
    status: Order["status"],
    trackingNumber?: string
  ): Promise<{ success: boolean; data: Order }> {
    return apiClient<{ success: boolean; data: Order }>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, trackingNumber }),
    });
  },
};
