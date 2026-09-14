import { ENV } from "../config/env";

export interface PaymentInitResult {
  success: boolean;
  paymentId: string;
  gatewayUrl: string;
  transactionId?: string;
  amount: number;
}

export const paymentGatewayService = {
  // bKash Tokenized Checkout
  async initBkash(orderId: string, amount: number): Promise<PaymentInitResult> {
    const paymentId = `BK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return {
      success: true,
      paymentId,
      gatewayUrl: `${ENV.CLIENT_URL}/order-success/${orderId}?payment=bkash&trxId=${paymentId}`,
      amount,
    };
  },

  async executeBkash(paymentId: string): Promise<{ success: boolean; transactionId: string; status: string }> {
    const trxId = `TRX${Date.now().toString(36).toUpperCase()}`;
    return {
      success: true,
      transactionId: trxId,
      status: "COMPLETED",
    };
  },

  // Nagad PGW
  async initNagad(orderId: string, amount: number): Promise<PaymentInitResult> {
    const paymentId = `NGD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return {
      success: true,
      paymentId,
      gatewayUrl: `${ENV.CLIENT_URL}/order-success/${orderId}?payment=nagad&trxId=${paymentId}`,
      amount,
    };
  },

  // SSLCommerz
  async initSslcommerz(orderId: string, amount: number): Promise<PaymentInitResult> {
    const sessionKey = `SSL_${Date.now()}_SESSION`;
    return {
      success: true,
      paymentId: sessionKey,
      gatewayUrl: `${ENV.CLIENT_URL}/order-success/${orderId}?payment=sslcommerz&session=${sessionKey}`,
      amount,
    };
  },
};
