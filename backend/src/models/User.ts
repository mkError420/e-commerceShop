import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  role: "ADMIN" | "CUSTOMER" | "MANAGER";
  isBlocked?: boolean;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["ADMIN", "CUSTOMER", "MANAGER"], default: "CUSTOMER" },
    isBlocked: { type: Boolean, default: false },
    permissions: { type: [String], default: ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

