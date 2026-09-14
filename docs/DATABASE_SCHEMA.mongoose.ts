// Mongoose Schema & Models for High-Performance Bangladeshi E-Commerce
// MongoDB implementation with nested categories, variants, and localized shipping

import mongoose, { Schema, Document, Model } from "mongoose";

// --- Enums ---
export enum Role {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentGateway {
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  SSLCOMMERZ = "SSLCOMMERZ",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

// 1. Category Schema (Parent-Child Hierarchy)
export interface ICategory extends Document {
  nameEn: string;
  nameBn?: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured: boolean;
  parentId?: mongoose.Types.ObjectId | null;
  sortOrder: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: { type: String },
    isFeatured: { type: Boolean, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 2. Product Variant Sub-schema
const ProductVariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    title: { type: String, required: true }, // e.g., "Deep Maroon / 42 (L) / Silk"
    size: { type: String },
    colorName: { type: String },
    colorHex: { type: String },
    fabricOption: { type: String },
    priceAdjustmentBDT: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    image: { type: String },
  },
  { _id: true }
);

// 3. Product Schema
export interface IProduct extends Document {
  sku: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  descriptionEn: string;
  descriptionBn?: string;
  priceBDT: number;
  compareAtPriceBDT?: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealEnd?: Date;
  stockQuantity: number;
  images: string[];
  fabricType?: string;
  craftsmanship?: string;
  categoryId: mongoose.Types.ObjectId;
  variants: any[];
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    nameBn: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    descriptionEn: { type: String, required: true },
    descriptionBn: { type: String },
    priceBDT: { type: Number, required: true },
    compareAtPriceBDT: { type: Number },
    isFeatured: { type: Boolean, default: false, index: true },
    isFlashDeal: { type: Boolean, default: false },
    flashDealEnd: { type: Date },
    stockQuantity: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
    fabricType: { type: String }, // Dhakai Jamdani, Rajshahi Silk, Giza Cotton
    craftsmanship: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    variants: [ProductVariantSchema],
  },
  { timestamps: true }
);

// 4. Order Schema with Localized BD Shipping
export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  thana: string;
  streetLine: string;
  deliveryZone: "INSIDE_DHAKA" | "OUTSIDE_DHAKA";
  shippingFeeBDT: number; // 60 or 130
  subtotalBDT: number;
  discountBDT: number;
  totalBDT: number;
  couponCode?: string;
  status: OrderStatus;
  paymentGateway: PaymentGateway;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  transactionId?: string;
  items: any[];
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productTitle: { type: String, required: true },
  variantTitle: { type: String },
  unitPriceBDT: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPriceBDT: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true, index: true },
    customerEmail: { type: String },
    division: { type: String, required: true },
    district: { type: String, required: true },
    thana: { type: String, required: true },
    streetLine: { type: String, required: true },
    deliveryZone: { type: String, enum: ["INSIDE_DHAKA", "OUTSIDE_DHAKA"], default: "INSIDE_DHAKA" },
    shippingFeeBDT: { type: Number, required: true, default: 60 },
    subtotalBDT: { type: Number, required: true },
    discountBDT: { type: Number, default: 0 },
    totalBDT: { type: Number, required: true },
    couponCode: { type: String },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      required: true,
    },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    transactionId: { type: String },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
