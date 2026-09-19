import { Request, Response } from "express";
import mongoose from "mongoose";
import { dbStore, StoredOrder } from "../config/inMemoryStore";
import { OrderModel } from "../models/Order";
import { CustomerModel } from "../models/Customer";
import { isDatabaseConnected } from "../config/db";
import { courierService } from "../services/courierService";
import { paymentGatewayService } from "../services/paymentGatewayService";

function formatOrderOutput(o: any): any {
  return {
    id: o.id || o._id?.toString(),
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone || o.phone,
    customerEmail: o.customerEmail || o.email,
    division: o.division,
    district: o.district,
    thana: o.thana || "",
    streetLine: o.streetLine || o.address || "",
    deliveryZone: o.deliveryZone || (o.district?.toLowerCase().includes("dhaka") ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA"),
    shippingFeeBDT: o.shippingFeeBDT ?? o.shippingFee ?? 70,
    subtotalBDT: o.subtotalBDT ?? o.subtotal ?? 0,
    discountBDT: o.discountBDT ?? o.discountAmount ?? 0,
    vatTaxBDT: o.vatTaxBDT ?? 0,
    totalBDT: o.totalBDT ?? o.totalAmount ?? 0,
    couponCode: o.couponCode,
    status: o.status || "PENDING",
    paymentGateway: o.paymentGateway || o.paymentMethod || "CASH_ON_DELIVERY",
    paymentStatus: o.paymentStatus || "PENDING",
    transactionId: o.transactionId,
    courierName: o.courierName || o.courier || "Steadfast Courier",
    trackingId: o.trackingId || o.trackingNumber,
    items: o.items || [],
    notes: o.notes,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export const orderController = {
  // GET /api/v1/orders - List all orders
  async getAll(req: Request, res: Response): Promise<void> {
    const { status, paymentStatus, phone } = req.query;

    try {
      if (isDatabaseConnected()) {
        const query: Record<string, any> = {};
        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (phone) query.customerPhone = { $regex: String(phone).trim(), $options: "i" };

        const mongoOrders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
        if (mongoOrders && mongoOrders.length > 0) {
          const formatted = mongoOrders.map(formatOrderOutput);
          res.json({
            success: true,
            total: formatted.length,
            data: formatted,
            source: "mongodb",
          });
          return;
        }
      }
    } catch (dbErr: any) {
      console.warn("[Orders] MongoDB query notice:", dbErr?.message);
    }

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

    const formatted = orders.map(formatOrderOutput);
    res.json({
      success: true,
      total: formatted.length,
      data: formatted,
      source: "memory",
    });
  },

  // GET /api/v1/orders/:id - Single order
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      if (isDatabaseConnected()) {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query: Record<string, any> = {
          $or: [
            { id },
            { orderNumber: id },
            ...(isObjectId ? [{ _id: id }] : []),
          ],
        };
        const order = await OrderModel.findOne(query).lean();
        if (order) {
          res.json({
            success: true,
            data: formatOrderOutput(order),
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn("[Orders] MongoDB getById notice:", err?.message);
    }

    const order = dbStore.orders.find((o) => o.id === id || o.orderNumber === id);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.json({
      success: true,
      data: formatOrderOutput(order),
    });
  },

  // GET /api/v1/orders/track - Track order by phone or tracking number
  async trackOrder(req: Request, res: Response): Promise<void> {
    const { trackingNumber, phone } = req.query;

    if (!trackingNumber && !phone) {
      res.status(400).json({ success: false, message: "Provide trackingNumber or phone to track order" });
      return;
    }

    try {
      if (isDatabaseConnected()) {
        const orConditions: any[] = [];
        if (trackingNumber) {
          orConditions.push({ trackingId: trackingNumber });
          orConditions.push({ orderNumber: trackingNumber });
          orConditions.push({ id: trackingNumber });
        }
        if (phone) {
          orConditions.push({ customerPhone: phone });
        }

        const mongoOrders = await OrderModel.find({ $or: orConditions }).lean();
        if (mongoOrders && mongoOrders.length > 0) {
          res.json({
            success: true,
            count: mongoOrders.length,
            data: mongoOrders.map(formatOrderOutput),
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn("[Orders] MongoDB trackOrder error:", err?.message);
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
      data: matched.map(formatOrderOutput),
    });
  },

  // POST /api/v1/orders - Place order
  async create(req: Request, res: Response): Promise<void> {
    const body = req.body;
    const customerName = body.customerName;
    const phone = body.customerPhone || body.phone;
    const email = body.customerEmail || body.email;
    const division = body.division || "Dhaka";
    const district = body.district || "Dhaka";
    const thana = body.thana || "";
    const streetLine = body.streetLine || body.address || "";
    const items = body.items || [];
    const paymentMethod = body.paymentGateway || body.paymentMethod || "CASH_ON_DELIVERY";
    const couponCode = body.couponCode;
    const notes = body.notes;

    if (!customerName || !phone || !items || !items.length) {
      res.status(400).json({
        success: false,
        message: "customerName, phone, and items are required to place an order",
      });
      return;
    }

    // 1. Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.unitPriceBDT ?? item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    // 2. Shipping calculation
    const isInsideDhaka =
      district.toLowerCase().includes("dhaka") || thana.toLowerCase().includes("dhaka");
    const shipping = courierService.calculateDeliveryCharge(isInsideDhaka, items.length);
    const shippingFee = body.shippingFeeBDT ?? shipping.totalFee;

    // 3. Discount calculation
    let discountAmount = Number(body.discountBDT) || 0;
    if (!discountAmount && couponCode) {
      const coupon = dbStore.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive
      );
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

    const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);
    const orderId = body.id || `ord-${Date.now()}`;
    const orderNumber =
      body.orderNumber || `BD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingId =
      body.trackingId || courierService.generateTrackingNumber(shipping.courierName);
    const courierName = body.courierName || shipping.courierName;

    const newOrderData = {
      id: orderId,
      orderNumber,
      customerName,
      customerPhone: phone,
      customerEmail: email,
      division,
      district,
      thana,
      streetLine,
      deliveryZone: isInsideDhaka ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA",
      shippingFeeBDT: shippingFee,
      subtotalBDT: subtotal,
      discountBDT: discountAmount,
      vatTaxBDT: 0,
      totalBDT: totalAmount,
      couponCode,
      status: "PENDING",
      paymentGateway: paymentMethod,
      paymentStatus: paymentMethod === "CASH_ON_DELIVERY" || paymentMethod === "COD" ? "PENDING" : "PAID",
      transactionId: body.transactionId || `TRX-${Date.now()}`,
      courierName,
      trackingId,
      items: items.map((it: any) => ({
        productId: it.productId || it.id || "prod",
        productTitle: it.productTitle || it.title || it.nameEn || "Item",
        variantTitle: it.variantTitle || it.size || "",
        unitPriceBDT: Number(it.unitPriceBDT ?? it.price ?? 0),
        quantity: Number(it.quantity || 1),
        totalPriceBDT: Number((it.unitPriceBDT ?? it.price ?? 0) * (it.quantity || 1)),
        size: it.size,
        color: it.color,
        image: it.image || (it.product?.images && it.product.images[0]) || "",
      })),
      notes,
    };

    // 1. Save in MongoDB if connected
    let savedInDb = false;
    try {
      if (isDatabaseConnected()) {
        await OrderModel.create(newOrderData);
        savedInDb = true;
        console.log(`✅ [MongoDB] Order created in database: #${orderNumber} for ${customerName}`);

        // Also create or update customer profile in Customer collection
        try {
          const existingCustomer = await CustomerModel.findOne({ phone: phone });
          if (existingCustomer) {
            await CustomerModel.updateOne(
              { phone: phone },
              {
                $set: {
                  name: customerName,
                  email: email,
                  lastOrderDate: new Date(),
                  isVerified: true,
                },
                $inc: {
                  totalOrdersCount: 1,
                  totalSpentBDT: totalAmount,
                },
              }
            );
            console.log(`✅ [MongoDB] Customer profile updated for: ${phone}`);
          } else {
            await CustomerModel.create({
              name: customerName,
              phone: phone,
              email: email,
              passwordHash: "order_generated",
              totalOrdersCount: 1,
              totalSpentBDT: totalAmount,
              lastOrderDate: new Date(),
              isVerified: true,
              loyaltyPoints: 100,
              loyaltyTier: "Bronze",
            });
            console.log(`✅ [MongoDB] New customer profile created for: ${phone}`);
          }
        } catch (custErr: any) {
          console.warn("[MongoDB] Customer profile update warning:", custErr?.message);
        }
      }
    } catch (err: any) {
      console.warn("[MongoDB] Order create notice:", err?.message);
    }

    // 2. Also keep memory store updated
    const memoryOrder: StoredOrder = {
      id: orderId,
      orderNumber,
      customerName,
      phone,
      email,
      division,
      district,
      thana,
      address: streetLine,
      items: newOrderData.items,
      subtotal,
      shippingFee,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod === "CASH_ON_DELIVERY" ? "COD" : paymentMethod,
      paymentStatus: newOrderData.paymentStatus === "PAID" ? "PAID" : "UNPAID",
      status: "PENDING",
      trackingNumber: trackingId,
      courier: courierName,
      notes,
      createdAt: new Date().toISOString(),
    };
    dbStore.orders.unshift(memoryOrder);

    // Online Payment Gateway generation if applicable
    let paymentRedirectUrl: string | undefined;
    if (paymentMethod === "BKASH") {
      const resG = await paymentGatewayService.initBkash(orderId, totalAmount);
      paymentRedirectUrl = resG.gatewayUrl;
    } else if (paymentMethod === "NAGAD") {
      const resG = await paymentGatewayService.initNagad(orderId, totalAmount);
      paymentRedirectUrl = resG.gatewayUrl;
    } else if (paymentMethod === "SSLCOMMERZ") {
      const resG = await paymentGatewayService.initSslcommerz(orderId, totalAmount);
      paymentRedirectUrl = resG.gatewayUrl;
    }

    res.status(201).json({
      success: true,
      message: savedInDb ? "Order saved to database successfully" : "Order placed successfully",
      data: formatOrderOutput(newOrderData),
      paymentUrl: paymentRedirectUrl,
    });
  },

  // PATCH /api/v1/orders/:id/status - Update status (Admin)
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, paymentStatus, trackingNumber, trackingId, notes } = req.body;

    const trackVal = trackingId || trackingNumber;

    // 1. Update in MongoDB
    let updatedInDb = false;
    try {
      if (isDatabaseConnected()) {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const query: Record<string, any> = {
          $or: [
            { id },
            { orderNumber: id },
            ...(isObjectId ? [{ _id: id }] : []),
          ],
        };
        const updateFields: Record<string, any> = {};
        if (status) updateFields.status = status;
        if (paymentStatus) updateFields.paymentStatus = paymentStatus;
        if (trackVal) updateFields.trackingId = trackVal;
        if (notes) updateFields.notes = notes;

        const updatedDoc: any = await OrderModel.findOneAndUpdate(query, { $set: updateFields }, { new: true }).lean();
        if (updatedDoc) {
          updatedInDb = true;
          console.log(`✅ [MongoDB] Order status updated in database: #${updatedDoc.orderNumber} -> ${status}`);
        }
      }
    } catch (err: any) {
      console.warn("[MongoDB] Order updateStatus notice:", err?.message);
    }

    // 2. Update memory store
    const order = dbStore.orders.find((o) => o.id === id || o.orderNumber === id);
    if (order) {
      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (trackVal) order.trackingNumber = trackVal;
      if (notes) order.notes = notes;
    }

    const current = order ? formatOrderOutput(order) : { id, status, paymentStatus };

    res.json({
      success: true,
      message: updatedInDb ? "Order status updated in database" : "Order status updated",
      data: current,
    });
  },

  // PUT /api/v1/orders/:id - Update order details (Admin)
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const body = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query: Record<string, any> = {
      $or: [
        { id },
        { orderNumber: id },
        ...(isObjectId ? [{ _id: id }] : []),
      ],
    };

    let updatedDoc: any = null;
    try {
      if (isDatabaseConnected()) {
        const updateData: Record<string, any> = {
          ...body,
          updatedAt: new Date(),
        };
        if (body.customerPhone) updateData.customerPhone = body.customerPhone;
        if (body.phone) updateData.customerPhone = body.phone;
        if (body.customerEmail) updateData.customerEmail = body.customerEmail;
        if (body.email) updateData.customerEmail = body.email;
        if (body.streetLine) updateData.streetLine = body.streetLine;
        if (body.address) updateData.streetLine = body.address;

        updatedDoc = await OrderModel.findOneAndUpdate(query, { $set: updateData }, { new: true }).lean();
        if (updatedDoc) {
          console.log(`✅ [MongoDB] Order updated in database: #${updatedDoc.orderNumber}`);
        }
      }
    } catch (err: any) {
      console.warn("[MongoDB] Order update notice:", err?.message);
    }

    // Update memory store
    const memOrder = dbStore.orders.find((o) => o.id === id || o.orderNumber === id);
    if (memOrder) {
      if (body.customerName !== undefined) memOrder.customerName = body.customerName;
      if (body.customerPhone !== undefined || body.phone !== undefined) memOrder.phone = body.customerPhone || body.phone;
      if (body.customerEmail !== undefined || body.email !== undefined) memOrder.email = body.customerEmail || body.email;
      if (body.division !== undefined) memOrder.division = body.division;
      if (body.district !== undefined) memOrder.district = body.district;
      if (body.thana !== undefined) memOrder.thana = body.thana;
      if (body.streetLine !== undefined || body.address !== undefined) memOrder.address = body.streetLine || body.address;
      if (body.courierName !== undefined || body.courier !== undefined) memOrder.courier = body.courierName || body.courier;
      if (body.trackingId !== undefined || body.trackingNumber !== undefined) memOrder.trackingNumber = body.trackingId || body.trackingNumber;
      if (body.status !== undefined) memOrder.status = body.status;
      if (body.paymentStatus !== undefined) memOrder.paymentStatus = body.paymentStatus;
      if (body.paymentGateway !== undefined || body.paymentMethod !== undefined) memOrder.paymentMethod = body.paymentGateway || body.paymentMethod;
      if (body.shippingFeeBDT !== undefined) memOrder.shippingFee = body.shippingFeeBDT;
      if (body.totalBDT !== undefined) memOrder.totalAmount = body.totalBDT;
      if (body.subtotalBDT !== undefined) memOrder.subtotal = body.subtotalBDT;
      if (body.items !== undefined) memOrder.items = body.items;
      if (body.notes !== undefined) memOrder.notes = body.notes;
    }

    const current = updatedDoc ? formatOrderOutput(updatedDoc) : memOrder ? formatOrderOutput(memOrder) : { id, ...body };

    res.json({
      success: true,
      message: "Order updated successfully",
      data: current,
    });
  },

  // DELETE /api/v1/orders/:id - Delete order (Admin)
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: "Order ID is required" });
        return;
      }

      let deletedFromDb = false;
      try {
        if (isDatabaseConnected()) {
          const isHex24ObjectId = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
          const query: Record<string, any> = {
            $or: [
              { id },
              { orderNumber: id },
              ...(isHex24ObjectId ? [{ _id: new mongoose.Types.ObjectId(id) }] : []),
            ],
          };
          const result = await OrderModel.findOneAndDelete(query);
          if (result) {
            deletedFromDb = true;
            console.log(`✅ [MongoDB] Order deleted from database: ${id}`);
          }
        }
      } catch (err: any) {
        console.warn("[MongoDB] Order delete notice:", err?.message);
      }

      // Delete from memory store
      const idx = dbStore.orders.findIndex((o) => o && (o.id === id || o.orderNumber === id));
      if (idx !== -1) {
        dbStore.orders.splice(idx, 1);
      }

      res.json({
        success: true,
        message: deletedFromDb ? "Order deleted from database" : "Order deleted successfully",
        orderId: id,
      });
    } catch (err: any) {
      console.error("[Orders] Delete controller error:", err);
      res.status(200).json({
        success: true,
        message: "Order removed successfully",
        orderId: req.params?.id || "",
      });
    }
  },
};
