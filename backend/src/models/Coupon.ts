import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "PERCENTAGE" | "FIXED_BDT" | "PERCENT" | "FIXED";
  value: number;
  minSpendBDT: number;
  maxDiscount?: number;
  description?: string;
  isActive: boolean;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, required: true, default: "PERCENTAGE" },
    value: { type: Number, required: true },
    minSpendBDT: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

export const CouponModel =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
