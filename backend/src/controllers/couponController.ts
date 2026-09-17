import { Request, Response } from "express";
import { dbStore, StoredCoupon } from "../config/inMemoryStore";
import { CouponModel } from "../models/Coupon";
import { isDatabaseConnected } from "../config/db";

export const couponController = {
  // POST /api/v1/coupons/validate - Validate promo code
  async validate(req: Request, res: Response): Promise<void> {
    const { code, cartTotal } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: "Coupon code is required" });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const subtotal = Number(cartTotal) || 0;

    let coupon: any = null;

    try {
      if (isDatabaseConnected()) {
        const mongoCoupon: any = await CouponModel.findOne({ code: cleanCode, isActive: true }).lean();
        if (mongoCoupon) {
          coupon = {
            code: mongoCoupon.code,
            discountType: mongoCoupon.type === "PERCENTAGE" ? "PERCENT" : "FIXED",
            discountValue: mongoCoupon.value,
            minSpend: mongoCoupon.minSpendBDT,
            maxDiscount: mongoCoupon.maxDiscount,
            isActive: mongoCoupon.isActive,
          };
        }
      }
    } catch (err: any) {
      console.warn("[Coupons] MongoDB lookup notice:", err?.message);
    }

    if (!coupon) {
      coupon = dbStore.coupons.find(
        (c) => c.code.toUpperCase() === cleanCode && c.isActive
      );
    }

    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid or expired coupon code." });
      return;
    }

    if (subtotal < (coupon.minSpend || 0)) {
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
    try {
      if (isDatabaseConnected()) {
        const mongoCoupons = await CouponModel.find().lean();
        if (mongoCoupons && mongoCoupons.length > 0) {
          res.json({
            success: true,
            data: mongoCoupons.map((c) => ({
              code: c.code,
              type: c.type,
              discountType: c.type === "PERCENTAGE" ? "PERCENT" : "FIXED",
              value: c.value,
              discountValue: c.value,
              minSpendBDT: c.minSpendBDT,
              minSpend: c.minSpendBDT,
              maxDiscount: c.maxDiscount,
              isActive: c.isActive,
              description: c.description,
            })),
            source: "mongodb",
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn("[Coupons] MongoDB getAll error:", err?.message);
    }

    res.json({
      success: true,
      data: dbStore.coupons,
      source: "memory",
    });
  },

  // POST /api/v1/coupons - Create new coupon
  async create(req: Request, res: Response): Promise<void> {
    const { code, discountType, discountValue, minSpend, maxDiscount, isActive, type, value, minSpendBDT } = req.body;

    const couponCode = (code || "").toUpperCase().trim();
    const finalVal = Number(discountValue ?? value ?? 0);
    const finalType = discountType || (type === "FIXED_BDT" ? "FIXED" : "PERCENT");
    const finalMinSpend = Number(minSpend ?? minSpendBDT ?? 0);

    if (!couponCode || !finalVal) {
      res.status(400).json({ success: false, message: "code and discountValue are required" });
      return;
    }

    try {
      if (isDatabaseConnected()) {
        await CouponModel.create({
          code: couponCode,
          type: finalType === "PERCENT" ? "PERCENTAGE" : "FIXED_BDT",
          value: finalVal,
          minSpendBDT: finalMinSpend,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        });
        console.log(`✅ [MongoDB] Coupon created: ${couponCode}`);
      }
    } catch (err: any) {
      console.warn("[Coupons] MongoDB create notice:", err?.message);
    }

    const newCoupon: StoredCoupon = {
      code: couponCode,
      discountType: finalType,
      discountValue: finalVal,
      minSpend: finalMinSpend,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    const existingIndex = dbStore.coupons.findIndex((c) => c.code.toUpperCase() === couponCode);
    if (existingIndex !== -1) {
      dbStore.coupons[existingIndex] = newCoupon;
    } else {
      dbStore.coupons.push(newCoupon);
    }

    res.status(201).json({
      success: true,
      data: newCoupon,
    });
  },
};
