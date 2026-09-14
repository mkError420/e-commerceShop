import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: string;
  gateway: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD";
  transactionId?: string;
  gatewayPaymentId?: string;
  amountBDT: number;
  status: "INITIALIZED" | "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  rawResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, index: true },
    gateway: { type: String, enum: ["BKASH", "NAGAD", "SSLCOMMERZ", "COD"], required: true },
    transactionId: { type: String },
    gatewayPaymentId: { type: String },
    amountBDT: { type: Number, required: true },
    status: {
      type: String,
      enum: ["INITIALIZED", "PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "INITIALIZED",
    },
    rawResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
