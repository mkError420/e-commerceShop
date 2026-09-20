import mongoose, { Schema, Document } from "mongoose";

// ─── Address Sub-Document ────────────────────────────────────────────────────
export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: "Home" | "Office" | "Other";
  recipientName: string;
  phone: string;
  addressLine: string;
  thana: string;
  district: string;
  division: string;
  postalCode?: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, enum: ["Home", "Office", "Other"], default: "Home" },
    recipientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    thana: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// ─── Customer Document Interface ─────────────────────────────────────────────
export interface ICustomer extends Document {
  // ── Identity ───────────────────────────────────────────────────────────────
  name: string;
  nameBn?: string;                        // Optional Bangla name
  phone: string;                          // Primary login identifier (BD format)
  email?: string;
  passwordHash: string;
  avatarUrl?: string;                     // Profile photo (ImageKit URL)
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dateOfBirth?: Date;
  nationalIdOrPassport?: string;          // NID / Passport for high-value orders

  // ── Contact & Addresses ────────────────────────────────────────────────────
  addresses: IAddress[];
  defaultAddressIndex?: number;

  // ── Account Status ─────────────────────────────────────────────────────────
  isVerified: boolean;                    // Phone OTP verified
  isEmailVerified: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  role: "CUSTOMER" | "VIP" | "WHOLESALE";

  // ── OTP / Auth Tokens ──────────────────────────────────────────────────────
  phoneOtp?: string;
  phoneOtpExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;

  // ── Loyalty & Rewards ─────────────────────────────────────────────────────
  loyaltyPoints: number;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalOrdersCount: number;
  totalSpentBDT: number;
  referralCode?: string;                  // Unique referral code (auto-generated)
  referredByCode?: string;               // Code of the person who referred them

  // ── Wishlist & Preferences ─────────────────────────────────────────────────
  wishlist: string[];                     // Array of product IDs
  preferredCategories: string[];          // Category slugs for personalisation
  preferredLanguage: "bn" | "en";

  // ── Marketing & Notifications ─────────────────────────────────────────────
  allowSmsMarketing: boolean;
  allowEmailMarketing: boolean;
  allowPushNotifications: boolean;

  // ── Device & Security ─────────────────────────────────────────────────────
  lastLoginAt?: Date;
  lastLoginIp?: string;
  deviceTokens: string[];                 // FCM tokens for push notifications
  lastOrderDate?: Date;                  // Track when customer last placed an order

  // ── Timestamps ────────────────────────────────────────────────────────────
  createdAt: Date;
  updatedAt: Date;
}

// ─── Customer Schema ──────────────────────────────────────────────────────────
const CustomerSchema = new Schema<ICustomer>(
  {
    // Identity
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must not exceed 80 characters"],
    },
    nameBn: { type: String, trim: true },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      index: true,
      trim: true,
      validate: {
        validator: (v: string) => /^01\d{9}$/.test(v),
        message: "Phone must be a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX)",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,                       // Allows multiple null emails
      index: true,
      validate: {
        validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    passwordHash: { type: String, required: true, select: false }, // Never returned by default
    avatarUrl: { type: String, trim: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    dateOfBirth: { type: Date },
    nationalIdOrPassport: { type: String, trim: true, select: false },

    // Addresses
    addresses: { type: [AddressSchema], default: [] },
    defaultAddressIndex: { type: Number, default: 0 },

    // Account Status
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, trim: true },
    role: {
      type: String,
      enum: ["CUSTOMER", "VIP", "WHOLESALE"],
      default: "CUSTOMER",
    },

    // OTP / Auth
    phoneOtp: { type: String, select: false },
    phoneOtpExpiry: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },

    // Loyalty
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    totalOrdersCount: { type: Number, default: 0, min: 0 },
    totalSpentBDT: { type: Number, default: 0, min: 0 },
    referralCode: { type: String, unique: true, sparse: true, uppercase: true },
    referredByCode: { type: String, uppercase: true },

    // Wishlist & Preferences
    wishlist: { type: [String], default: [] },
    preferredCategories: { type: [String], default: [] },
    preferredLanguage: { type: String, enum: ["bn", "en"], default: "bn" },

    // Marketing
    allowSmsMarketing: { type: Boolean, default: true },
    allowEmailMarketing: { type: Boolean, default: false },
    allowPushNotifications: { type: Boolean, default: true },

    // Device & Security
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String, trim: true },
    deviceTokens: { type: [String], default: [] },
    lastOrderDate: { type: Date },
  },
  {
    timestamps: true,                     // Auto-manages createdAt / updatedAt
    collection: "Customers",             // Explicit MongoDB collection name
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
CustomerSchema.index({ loyaltyTier: 1 });
CustomerSchema.index({ isBlocked: 1 });
CustomerSchema.index({ totalSpentBDT: -1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ referralCode: 1 }, { sparse: true });

// ─── Middleware: Auto-update Loyalty Tier based on total spend ────────────────
CustomerSchema.pre("save", function (next: any) {
  const spent = this.totalSpentBDT;
  if (spent >= 50000) {
    this.loyaltyTier = "Platinum";
  } else if (spent >= 20000) {
    this.loyaltyTier = "Gold";
  } else if (spent >= 5000) {
    this.loyaltyTier = "Silver";
  } else {
    this.loyaltyTier = "Bronze";
  }
  next();
});

// ─── Middleware: Auto-generate referral code on first save ────────────────────
CustomerSchema.pre("save", function (next: any) {
  if (this.isNew && !this.referralCode) {
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const phoneSnippet = this.phone.slice(-4);
    this.referralCode = `BD${phoneSnippet}${suffix}`;
  }
  next();
});

// ─── Model Export ─────────────────────────────────────────────────────────────
export const CustomerModel =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
