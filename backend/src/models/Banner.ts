import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  titleEn: string;
  titleBn?: string;
  subtitleEn: string;
  subtitleBn?: string;
  ctaEn: string;
  ctaBn?: string;
  link: string;
  secondaryCtaEn?: string;
  secondaryCtaBn?: string;
  secondaryLink?: string;
  bgImage: string;
  tag: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    titleEn: { type: String, required: true, trim: true },
    titleBn: { type: String, trim: true },
    subtitleEn: { type: String, required: true, trim: true },
    subtitleBn: { type: String, trim: true },
    ctaEn: { type: String, required: true, default: "Explore Collection" },
    ctaBn: { type: String, default: "কালেকশন দেখুন" },
    link: { type: String, required: true, default: "/shop" },
    secondaryCtaEn: { type: String, default: "Browse All" },
    secondaryCtaBn: { type: String, default: "সব দেখুন" },
    secondaryLink: { type: String, default: "/shop" },
    bgImage: { type: String, required: true },
    tag: { type: String, default: "Featured Collection" },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const BannerModel = mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);
