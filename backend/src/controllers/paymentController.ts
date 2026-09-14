import { Request, Response } from "express";
import { dbStore } from "../config/inMemoryStore";
import { paymentGatewayService } from "../services/paymentGatewayService";

export const paymentController = {
  // POST /api/v1/payments/bkash/create
  async initBkash(req: Request, res: Response): Promise<void> {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
      res.status(400).json({ success: false, message: "orderId and amount are required" });
      return;
    }

    const result = await paymentGatewayService.initBkash(orderId, Number(amount));
    res.json({
      success: true,
      paymentID: result.paymentId,
      bkashURL: result.gatewayUrl,
      amount: String(amount),
      currency: "BDT",
    });
  },

  // POST /api/v1/payments/bkash/execute
  async executeBkash(req: Request, res: Response): Promise<void> {
    const { paymentID, orderId } = req.body;

    const result = await paymentGatewayService.executeBkash(paymentID || "BK_DEFAULT");

    if (orderId) {
      const order = dbStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
      if (order) {
        order.paymentStatus = "PAID";
        order.transactionId = result.transactionId;
        order.status = "PROCESSING";
      }
    }

    res.json({
      success: true,
      transactionId: result.transactionId,
      paymentStatus: "PAID",
      message: "bKash payment verified and executed successfully.",
    });
  },

  // POST /api/v1/payments/nagad/init
  async initNagad(req: Request, res: Response): Promise<void> {
    const { orderId, amount } = req.body;
    const result = await paymentGatewayService.initNagad(orderId, Number(amount));
    res.json({
      success: true,
      redirectUrl: result.gatewayUrl,
      paymentId: result.paymentId,
    });
  },

  // POST /api/v1/payments/sslcommerz/init
  async initSslcommerz(req: Request, res: Response): Promise<void> {
    const { orderId, amount } = req.body;
    const result = await paymentGatewayService.initSslcommerz(orderId, Number(amount));
    res.json({
      success: true,
      GatewayPageURL: result.gatewayUrl,
      sessionKey: result.paymentId,
    });
  },

  // POST /api/v1/payments/cod/confirm
  async confirmCod(req: Request, res: Response): Promise<void> {
    const { orderId } = req.body;
    const order = dbStore.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (order) {
      order.paymentMethod = "COD";
      order.paymentStatus = "UNPAID";
      order.status = "PROCESSING";
    }

    res.json({
      success: true,
      message: "Cash on Delivery confirmed. Preparing package for dispatch.",
    });
  },
};
