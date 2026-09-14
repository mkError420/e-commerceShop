import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Copy, Check, FileCode, Database, Server, Layers } from "lucide-react";

export const ArchitectureModal: React.FC = () => {
  const { isArchitectureModalOpen, setIsArchitectureModalOpen, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<"nextjs" | "prisma" | "mongoose" | "api">("nextjs");
  const [hasCopied, setHasCopied] = useState(false);

  if (!isArchitectureModalOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    showToast("Copied code to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const nextjsContent = `// Next.js App Router Multipage Route Tree
app/
├── layout.tsx                     // Root layout with Google Fonts, Header, Cart Drawer & Footer
├── page.tsx                       // Home Page (Hero Carousel, Heritage Spotlight, Flash Deals)
├── shop/
│   └── page.tsx                   // Catalog with Dynamic Faceted Filters, Sorting, Search
├── category/
│   └── [slug]/
│       └── page.tsx               // Dynamic Category & Subcategory Hub (Jamdani, Panjabi, etc.)
├── product/
│   └── [slug]/
│       └── page.tsx               // Product Details Page (Gallery, Size/Fabric Variants, BD Shipping)
├── cart/
│   └── page.tsx                   // Dedicated Shopping Cart with Coupon discounts
├── checkout/
│   └── page.tsx                   // Phone-number Quick Checkout + BD Cascade Address Selector
├── order-success/
│   └── [id]/
│       └── page.tsx               // Order Confirmation & Courier Tracking Waybill
├── track-order/
│   └── page.tsx                   // Visual Courier Tracker (Pathao / Steadfast)
├── admin/
│   ├── page.tsx                   // Admin Overview Analytics (BDT Revenue, Stock Alerts)
│   ├── products/page.tsx          // Inventory, Add/Edit Handloom Products
│   ├── orders/page.tsx            // Orders Fulfillment & Courier Assignment
│   ├── coupons/page.tsx           // Promotional Discount Codes
│   └── settings/page.tsx          // Inside/Outside Dhaka Delivery Rates & MFS Gateways
└── api/
    ├── orders/route.ts            // Place order, calculate BD shipping, inventory lock
    ├── payments/
    │   ├── bkash/route.ts         // bKash Create & Execute Payment API callback
    │   └── sslcommerz/route.ts    // IPN listener & Transaction Validator
    └── coupons/validate/route.ts  // Coupon code verification`;

  const prismaContent = `// Prisma ORM Schema (PostgreSQL / MySQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum DeliveryZone {
  INSIDE_DHAKA
  OUTSIDE_DHAKA
}

enum PaymentMethod {
  BKASH
  NAGAD
  SSLCOMMERZ
  CASH_ON_DELIVERY
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model Product {
  id                String          @id @default(cuid())
  nameEn            String
  nameBn            String
  slug              String          @unique
  sku               String          @unique
  categorySlug      String
  subcategorySlug   String?
  priceBDT          Int
  compareAtPriceBDT Int?
  costPriceBDT      Int?
  stockQuantity     Int             @default(0)
  lowStockAlert     Int             @default(5)
  images            String[]
  fabricType        String
  craftsmanship     String
  isFeatured        Boolean         @default(false)
  isFlashDeal       Boolean         @default(false)
  variants          ProductVariant[]
  orderItems        OrderItem[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model Order {
  id                String          @id @default(cuid())
  customerName      String
  customerPhone     String          // 11-digit Bangladeshi Phone
  division          String          // Dhaka, Chittagong, etc.
  district          String          // Dhaka City, Gazipur, etc.
  thana             String          // Dhanmondi, Gulshan, etc.
  streetLine        String
  deliveryZone      DeliveryZone
  shippingFeeBDT    Int             // 60 or 130
  subtotalBDT       Int
  discountBDT       Int             @default(0)
  totalBDT          Int
  status            OrderStatus     @default(PENDING)
  paymentGateway    PaymentMethod
  paymentStatus     String          @default("PENDING")
  transactionId     String?
  courierName       String?         // Pathao Express, Steadfast
  trackingId        String?
  items             OrderItem[]
  createdAt         DateTime        @default(now())
}`;

  const mongooseContent = `// Mongoose Schema (MongoDB)
import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  nameEn: { type: String, required: true },
  nameBn: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  categorySlug: { type: String, required: true },
  subcategorySlug: { type: String },
  priceBDT: { type: Number, required: true },
  stockQuantity: { type: Number, default: 0 },
  lowStockAlert: { type: Number, default: 5 },
  images: [{ type: String }],
  fabricType: { type: String, required: true },
  craftsmanship: { type: String },
  isFlashDeal: { type: Boolean, default: false }
}, { timestamps: true });

const OrderSchema = new Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  division: { type: String, required: true },
  district: { type: String, required: true },
  thana: { type: String, required: true },
  streetLine: { type: String, required: true },
  deliveryZone: { type: String, enum: ["INSIDE_DHAKA", "OUTSIDE_DHAKA"] },
  shippingFeeBDT: { type: Number, required: true },
  totalBDT: { type: Number, required: true },
  status: { type: String, default: "PENDING" },
  paymentGateway: { type: String, required: true },
  trackingId: { type: String }
}, { timestamps: true });

export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] text-[#E5E5E5] rounded-xl max-w-4xl w-full h-[85vh] flex flex-col border border-[#333333] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#222222]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-editorial text-base font-bold text-white">
                Next.js App Router & Database Architectural Blueprint
              </h3>
              <p className="text-[11px] text-[#999999]">
                Production-grade multi-page routing structure and dual Prisma/Mongoose schemas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsArchitectureModalOpen(false)}
            className="p-1 rounded hover:bg-[#333333] text-[#CCCCCC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#333333] bg-[#1E1E1E] text-xs font-mono">
          <button
            onClick={() => setActiveTab("nextjs")}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "nextjs" ? "border-emerald-400 text-white bg-[#262626]" : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>App Router Tree</span>
          </button>
          <button
            onClick={() => setActiveTab("prisma")}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "prisma" ? "border-emerald-400 text-white bg-[#262626]" : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>schema.prisma (SQL)</span>
          </button>
          <button
            onClick={() => setActiveTab("mongoose")}
            className={`px-4 py-2.5 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "mongoose" ? "border-emerald-400 text-white bg-[#262626]" : "border-transparent text-[#888888] hover:text-white"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Mongoose.ts (MongoDB)</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#111111] font-mono text-xs text-[#E0E0E0]">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => {
                const text = activeTab === "nextjs" ? nextjsContent : activeTab === "prisma" ? prismaContent : mongooseContent;
                handleCopy(text);
              }}
              className="flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333333] text-white px-3 py-1 rounded text-[11px]"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? "Copied" : "Copy Code"}</span>
            </button>
          </div>

          <pre className="whitespace-pre overflow-x-auto leading-relaxed">
            {activeTab === "nextjs" && nextjsContent}
            {activeTab === "prisma" && prismaContent}
            {activeTab === "mongoose" && mongooseContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
