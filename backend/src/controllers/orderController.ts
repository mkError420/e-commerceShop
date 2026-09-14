import { Request, Response } from "express";
import { dbStore, StoredOrder } from "../config/inMemoryStore";
import { courierService } from "../services/courierService";
import { paymentGatewayService } from "../services/paymentGatewayService";

export const orderController = {
  // GET /api/v1/orders - List all orders (Admin or Customer)
  async getAll(req: Request, res: Response): Promise<void> {
    const { status, paymentStatus, phone } = req.query;

    let orders = [...dbStore.orders];

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }
    if (paymentStatus) {
      orders = orders.filter((o) => o.paymentStatus === paymentStatus);
    }
    if (phone) {
      orders = orders.filter((o) => o.phone.includes(String(phone)));
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      total: orders.length,
      data: orders,
    });
  },

  // GET /api/v1/orders/:id - Single order
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const order = dbStore.orders.find((o) => o.id === id || o.orderNumber === id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  },

  // GET /api/v1/orders/track - Track order by phone or tracking number
  async trackOrder(req: Request, res: Response): Promise<void> {
    const { trackingNumber, phone } = req.query;

    if (!trackingNumber && !phone) {
      res.status(400).json({ success: false, message: "Provide trackingNumber or phone to track order" });
      return;
    }

    const matched = dbStore.orders.filter((o) => {
      if (trackingNumber && (o.trackingNumber === trackingNumber || o.orderNumber === trackingNumber)) {
        return true;
      }
      if (phone && o.phone === phone) {
        return true;
      }
      return false;
    });

    res.json({
      success: true,
      count: matched.length,
      data: matched,
    });
  },

  // POST /api/v1/orders - Place order
  async create(req: Request, res: Response): Promise<void> {
    const body = req.body;
    const {
      customerName,
      phone,
      email,
      division,
      district,
      thana,
      address,
      items,
      paymentMethod,
      couponCode,
      notes,
    } = body;

    if (!customerName || !phone || !division || !district || !items || !items.length) {
      res.status(400).json({
        success: false,
        message: "customerName, phone, division, district, and items are required",
      });
      return;
    }

    // 1. Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    // 2. Shipping calculation
    const isInsideDhaka = district.toLowerCase().includes("dhaka") || thana.toLowerCase().includes("dhaka");
    const shipping = courierService.calculateDeliveryCharge(isInsideDhaka, items.length);

    // 3. Discount calculation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = dbStore.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minSpend) {
        if (coupon.discountType === "PERCENT") {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + shipping.totalFee - discountAmount);
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `BD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingNumber = courierService.generateTrackingNumber(shipping.courierName);

    const newOrder: StoredOrder = {
      id: orderId,
      orderNumber,
      customerName,
      phone,
      email,
      division,
      district,
      thana: thana || "",
      address,
      items,
      subtotal,
      shippingFee: shipping.totalFee,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "COD" ? "UNPAID" : "UNPAID",
      status: "PENDING",
      trackingNumber,
      courier: shipping.courierName,
      notes,
      createdAt: new Date().toISOString(),
    };

    dbStore.orders.unshift(newOrder);

    // If online payment gateway selected, generate URL
    let paymentRedirectUrl: string | undefined;
    if (paymentMethod === "BKASH") {
      const res = await paymentGatewayService.initBkash(orderId, totalAmount);
      paymentRedirectUrl = res.gatewayUrl;
    } else if (paymentMethod === "NAGAD") {
      const res = await paymentGatewayService.initNagad(orderId, totalAmount);
      paymentRedirectUrl = res.gatewayUrl;
    } else if (paymentMethod === "SSLCOMMERZ") {
      const res = await paymentGatewayService.initSslcommerz(orderId, totalAmount);
      paymentRedirectUrl = res.gatewayUrl;
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
      paymentUrl: paymentRedirectUrl,
    });
  },

  // PATCH /api/v1/orders/:id/status - Update status (Admin)
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber, notes } = req.body;

    const order = dbStore.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    res.json({
      success: true,
      data: order,
    });
  },
};
