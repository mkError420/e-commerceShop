import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  nameEn: string;
  nameBn?: string;
  slug: string;
  descriptionEn?: string;
  descriptionBn?: string;
  image?: string;
  isFeatured: boolean;
  parentId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    nameEn: { type: String, required: true, trim: true },
    nameBn: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    descriptionEn: { type: String },
    descriptionBn: { type: String },
    image: { type: String },
    isFeatured: { type: Boolean, default: false },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
