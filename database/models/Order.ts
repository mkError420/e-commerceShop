import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  productTitle: string;
  unitPriceBDT: number;
  quantity: number;
  totalPriceBDT: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  division: string;
  district: string;
  thana: string;
  streetLine: string;
  shippingFeeBDT: number;
  subtotalBDT: number;
  discountBDT: number;
  totalBDT: number;
  couponCode?: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentGateway: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD";
  paymentStatus: "UNPAID" | "PAID" | "FAILED";
  transactionId?: string;
  trackingNumber?: string;
  courierName: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    unitPriceBDT: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPriceBDT: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    image: { type: String },
  },
  { _id: false }
);

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
    shippingFeeBDT: { type: Number, required: true, default: 70 },
    subtotalBDT: { type: Number, required: true },
    discountBDT: { type: Number, default: 0 },
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
      enum: ["BKASH", "NAGAD", "SSLCOMMERZ", "COD"],
      required: true,
    },
    paymentStatus: { type: String, enum: ["UNPAID", "PAID", "FAILED"], default: "UNPAID" },
    transactionId: { type: String },
    trackingNumber: { type: String },
    courierName: { type: String, default: "Steadfast Courier" },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
