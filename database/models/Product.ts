import mongoose, { Schema, Document } from "mongoose";

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
  stockQuantity: number;
  dhakaHubStock: number;
  chittagongHubStock: number;
  images: string[];
  categorySlug: string;
  subCategorySlug?: string;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
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
    stockQuantity: { type: Number, required: true, default: 0 },
    dhakaHubStock: { type: Number, default: 0 },
    chittagongHubStock: { type: Number, default: 0 },
    images: [{ type: String }],
    categorySlug: { type: String, required: true, index: true },
    subCategorySlug: { type: String },
    sizes: [{ type: String }],
    colors: [{ name: String, hex: String }],
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
