import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  productTitle: string;
  variantTitle?: string;
  unitPriceBDT: number;
  quantity: number;
  totalPriceBDT: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  thana: string;
  streetLine: string;
  deliveryZone: string;
  shippingFeeBDT: number;
  subtotalBDT: number;
  discountBDT: number;
  vatTaxBDT: number;
  totalBDT: number;
  couponCode?: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentGateway: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "CASH_ON_DELIVERY" | "COD";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "UNPAID" | "REFUNDED";
  transactionId?: string;
  courierName: string;
  trackingId?: string;
  items: IOrderItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    variantTitle: { type: String },
    unitPriceBDT: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    totalPriceBDT: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, index: true, trim: true },
    customerEmail: { type: String, trim: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    thana: { type: String, default: "" },
    streetLine: { type: String, default: "" },
    deliveryZone: { type: String, default: "INSIDE_DHAKA" },
    shippingFeeBDT: { type: Number, required: true, default: 70 },
    subtotalBDT: { type: Number, required: true },
    discountBDT: { type: Number, default: 0 },
    vatTaxBDT: { type: Number, default: 0 },
    totalBDT: { type: Number, required: true },
    couponCode: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: ["BKASH", "NAGAD", "SSLCOMMERZ", "CASH_ON_DELIVERY", "COD"],
      default: "CASH_ON_DELIVERY",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "UNPAID", "REFUNDED"],
      default: "PENDING",
    },
    transactionId: { type: String },
    courierName: { type: String, default: "Steadfast Courier" },
    trackingId: { type: String },
    items: { type: [OrderItemSchema], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
