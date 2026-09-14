import { apiClient } from "./api";

export interface BkashInitResponse {
  success: boolean;
  paymentID: string;
  createTime: string;
  orgLogo: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  transactionId: string;
  paymentStatus: "PAID" | "FAILED" | "PENDING";
  message: string;
}

export const paymentService = {
  // bKash Create Payment
  async createBkashPayment(orderId: string, amount: number): Promise<BkashInitResponse> {
    return apiClient<BkashInitResponse>("/payments/bkash/create", {
      method: "POST",
      body: JSON.stringify({ orderId, amount }),
    });
  },

  // bKash Execute Payment
  async executeBkashPayment(paymentID: string): Promise<PaymentVerifyResponse> {
    return apiClient<PaymentVerifyResponse>("/payments/bkash/execute", {
      method: "POST",
      body: JSON.stringify({ paymentID }),
    });
  },

  // Nagad Payment Initialization
  async initNagadPayment(orderId: string, amount: number): Promise<{ success: boolean; redirectUrl: string }> {
    return apiClient<{ success: boolean; redirectUrl: string }>("/payments/nagad/init", {
      method: "POST",
      body: JSON.stringify({ orderId, amount }),
    });
  },

  // SSLCommerz Session Initialization
  async initSslcommerz(orderId: string, amount: number): Promise<{ success: boolean; GatewayPageURL: string }> {
    return apiClient<{ success: boolean; GatewayPageURL: string }>("/payments/sslcommerz/init", {
      method: "POST",
      body: JSON.stringify({ orderId, amount }),
    });
  },

  // Cash on Delivery confirmation
  async confirmCod(orderId: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>("/payments/cod/confirm", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  },
};
