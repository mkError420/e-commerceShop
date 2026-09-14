import { Request, Response } from "express";
import { dbStore, StoredCoupon } from "../config/inMemoryStore";

export const couponController = {
  // POST /api/v1/coupons/validate - Validate promo code
  async validate(req: Request, res: Response): Promise<void> {
    const { code, cartTotal } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: "Coupon code is required" });
      return;
    }

    const subtotal = Number(cartTotal) || 0;
    const coupon = dbStore.coupons.find(
      (c) => c.code.toUpperCase() === String(code).trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid or expired coupon code." });
      return;
    }

    if (subtotal < coupon.minSpend) {
      res.status(400).json({
        success: false,
        message: `Minimum spend of ৳${coupon.minSpend.toLocaleString()} required for this coupon.`,
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENT") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon,
      discountAmount,
    });
  },

  // GET /api/v1/coupons - List all coupons (Admin)
  async getAll(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: dbStore.coupons,
    });
  },

  // POST /api/v1/coupons - Create new coupon
  async create(req: Request, res: Response): Promise<void> {
    const { code, discountType, discountValue, minSpend, maxDiscount, isActive } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({ success: false, message: "code, discountType, and discountValue are required" });
      return;
    }

    const existing = dbStore.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (existing) {
      res.status(409).json({ success: false, message: "Coupon with this code already exists" });
      return;
    }

    const newCoupon: StoredCoupon = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    dbStore.coupons.push(newCoupon);

    res.status(201).json({
      success: true,
      data: newCoupon,
    });
  },
};
