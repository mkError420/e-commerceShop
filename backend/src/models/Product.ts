import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariant {
  id: string;
  title: string;
  size?: string;
  colorName?: string;
  colorHex?: string;
  fabricOption?: string;
  priceAdjustmentBDT: number;
  stockQuantity: number;
  image?: string;
}

export interface IProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
  photoUrl?: string;
}

export interface IProduct extends Document {
  id: string;
  sku: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  descriptionEn: string;
  descriptionBn?: string;
  priceBDT: number;
  compareAtPriceBDT?: number;
  costPriceBDT?: number;
  categorySlug: string;
  categoryNameEn?: string;
  categoryNameBn?: string;
  subcategorySlug?: string;
  subcategoryNameEn?: string;
  subcategoryNameBn?: string;
  stockQuantity: number;
  lowStockAlert: number;
  dhakaHubStock: number;
  chittagongHubStock: number;
  images: string[];
  fabricType?: string;
  craftsmanship?: string;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealEnd?: string;
  variants: IProductVariant[];
  reviews: IProductReview[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    size: { type: String },
    colorName: { type: String },
    colorHex: { type: String },
    fabricOption: { type: String },
    priceAdjustmentBDT: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 10 },
    image: { type: String },
  },
  { _id: false }
);

const ProductReviewSchema = new Schema<IProductReview>(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    rating: { type: Number, default: 5 },
    date: { type: String, required: true },
    comment: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    photoUrl: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    descriptionEn: { type: String, default: "" },
    descriptionBn: { type: String, default: "" },
    priceBDT: { type: Number, required: true },
    compareAtPriceBDT: { type: Number },
    costPriceBDT: { type: Number },
    categorySlug: { type: String, required: true, index: true },
    categoryNameEn: { type: String },
    categoryNameBn: { type: String },
    subcategorySlug: { type: String },
    subcategoryNameEn: { type: String },
    subcategoryNameBn: { type: String },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockAlert: { type: Number, default: 5 },
    dhakaHubStock: { type: Number, default: 0 },
    chittagongHubStock: { type: Number, default: 0 },
    images: [{ type: String }],
    fabricType: { type: String, default: "" },
    craftsmanship: { type: String, default: "" },
    sizes: [{ type: String }],
    colors: [{ name: String, hex: String }],
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isFlashDeal: { type: Boolean, default: false },
    flashDealEnd: { type: String },
    variants: { type: [ProductVariantSchema], default: [] },
    reviews: { type: [ProductReviewSchema], default: [] },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
