import mongoose, { Schema, Document } from "mongoose";

export interface ISubcategory {
  id: string;
  nameEn: string;
  nameBn?: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  image?: string;
  isFeatured: boolean;
  parentSlug: string;
}

export interface ICategory extends Document {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  descriptionEn: string;
  descriptionBn: string;
  image: string;
  isFeatured: boolean;
  parentSlug?: string | null;
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>(
  {
    id: { type: String, required: true },
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, trim: true },
    slug: { type: String, required: true, trim: true },
    descriptionEn: { type: String, default: "" },
    descriptionBn: { type: String, default: "" },
    image: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    parentSlug: { type: String, required: true },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    descriptionEn: { type: String, default: "" },
    descriptionBn: { type: String, default: "" },
    image: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    parentSlug: { type: String, default: null },
    subcategories: { type: [SubcategorySchema], default: [] },
  },
  { timestamps: true }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
