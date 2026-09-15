import { Request, Response } from "express";
import { dbStore, StoredCategory } from "../config/inMemoryStore";
import { CategoryModel } from "../models/Category";
import mongoose from "mongoose";

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export const categoryController = {
  // GET /api/v1/categories - Hierarchical list
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      if (isMongoConnected()) {
        const mongoCategories = await CategoryModel.find().lean();
        if (mongoCategories && mongoCategories.length > 0) {
          res.json({
            success: true,
            data: mongoCategories,
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB read error, using memory store:", err?.message);
    }

    res.json({
      success: true,
      data: dbStore.categories,
    });
  },

  // GET /api/v1/categories/:slug - Single category with subcategories
  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;

    try {
      if (isMongoConnected()) {
        const cat = await CategoryModel.findOne({ slug }).lean();
        if (cat) {
          res.json({ success: true, data: cat });
          return;
        }
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB getBySlug error:", err?.message);
    }

    const cat = dbStore.categories.find((c) => c.slug === slug || c.id === slug);

    if (!cat) {
      // Check if it's a subcategory
      for (const parent of dbStore.categories) {
        const sub = parent.subcategories.find((s) => s.slug === slug || s.id === slug);
        if (sub) {
          res.json({ success: true, data: { ...sub, parentCategory: parent } });
          return;
        }
      }

      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    res.json({
      success: true,
      data: cat,
    });
  },

  // POST /api/v1/categories - Create category (Admin)
  async create(req: Request, res: Response): Promise<void> {
    const { nameEn, nameBn, slug, descriptionEn, descriptionBn, image, isFeatured, parentSlug } = req.body;

    if (!nameEn) {
      res.status(400).json({ success: false, message: "Category name in English is required" });
      return;
    }

    const catSlug = slug ? slug.trim() : nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // 1. If parentSlug or parent category specified, add as Subcategory
    if (parentSlug) {
      const parent = dbStore.categories.find((c) => c.slug === parentSlug || c.id === parentSlug);
      if (!parent) {
        res.status(404).json({ success: false, message: `Parent category '${parentSlug}' not found` });
        return;
      }

      const newSub = {
        id: `sub-${catSlug}-${Date.now().toString().slice(-4)}`,
        nameEn: nameEn.trim(),
        nameBn: nameBn ? nameBn.trim() : nameEn.trim(),
        slug: catSlug,
        descriptionEn: descriptionEn || "",
        descriptionBn: descriptionBn || "",
        image: image || "",
        isFeatured: Boolean(isFeatured),
        parentSlug: parent.slug,
      };

      parent.subcategories.push(newSub);

      try {
        if (isMongoConnected()) {
          await CategoryModel.findOneAndUpdate(
            { $or: [{ slug: parent.slug }, { id: parent.id }] },
            { $push: { subcategories: newSub } },
            { new: true, upsert: true }
          );
        }
      } catch (err: any) {
        console.warn("[CategoryController] MongoDB subcategory push error:", err?.message);
      }

      res.status(201).json({ success: true, data: newSub, message: "Sub-category created successfully" });
      return;
    }

    // 2. Create Top-level Category
    const newCategory: StoredCategory = {
      id: `cat-${catSlug}`,
      nameEn: nameEn.trim(),
      nameBn: nameBn ? nameBn.trim() : nameEn.trim(),
      slug: catSlug,
      descriptionEn: descriptionEn || "",
      descriptionBn: descriptionBn || "",
      image: image || "",
      isFeatured: Boolean(isFeatured),
      subcategories: [],
    };

    // Prevent duplicate slug in dbStore
    const existingIndex = dbStore.categories.findIndex((c) => c.slug === catSlug || c.id === newCategory.id);
    if (existingIndex >= 0) {
      dbStore.categories[existingIndex] = newCategory;
    } else {
      dbStore.categories.push(newCategory);
    }

    try {
      if (isMongoConnected()) {
        await CategoryModel.findOneAndUpdate(
          { slug: catSlug },
          { ...newCategory },
          { new: true, upsert: true }
        );
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB category create error:", err?.message);
    }

    res.status(201).json({ success: true, data: newCategory, message: "Category created successfully" });
  },

  // PUT /api/v1/categories/:id - Update Category (Admin)
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { nameEn, nameBn, slug, descriptionEn, descriptionBn, image, isFeatured } = req.body;

    const catIndex = dbStore.categories.findIndex((c) => c.id === id || c.slug === id);
    if (catIndex === -1) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    const current = dbStore.categories[catIndex];
    const updatedCategory: StoredCategory = {
      ...current,
      nameEn: nameEn !== undefined ? nameEn.trim() : current.nameEn,
      nameBn: nameBn !== undefined ? nameBn.trim() : current.nameBn,
      slug: slug !== undefined ? slug.trim() : current.slug,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : current.descriptionEn,
      descriptionBn: descriptionBn !== undefined ? descriptionBn : current.descriptionBn,
      image: image !== undefined ? image : current.image,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : current.isFeatured,
    };

    dbStore.categories[catIndex] = updatedCategory;

    try {
      if (isMongoConnected()) {
        await CategoryModel.findOneAndUpdate(
          { $or: [{ id }, { slug: id }] },
          { ...updatedCategory },
          { new: true }
        );
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB category update error:", err?.message);
    }

    res.json({ success: true, data: updatedCategory, message: "Category updated successfully" });
  },

  // DELETE /api/v1/categories/:id - Delete Category (Admin)
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const catIndex = dbStore.categories.findIndex((c) => c.id === id || c.slug === id);
    if (catIndex === -1) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    const deleted = dbStore.categories.splice(catIndex, 1)[0];

    try {
      if (isMongoConnected()) {
        await CategoryModel.findOneAndDelete({ $or: [{ id }, { slug: id }] });
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB category delete error:", err?.message);
    }

    res.json({ success: true, data: deleted, message: "Category deleted successfully" });
  },

  // POST /api/v1/categories/:categoryId/subcategories - Add Subcategory
  async createSubcategory(req: Request, res: Response): Promise<void> {
    const { categoryId } = req.params;
    const { nameEn, nameBn, slug, descriptionEn, descriptionBn, image, isFeatured } = req.body;

    if (!nameEn) {
      res.status(400).json({ success: false, message: "Subcategory name in English is required" });
      return;
    }

    const parent = dbStore.categories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (!parent) {
      res.status(404).json({ success: false, message: "Parent category not found" });
      return;
    }

    const subSlug = slug ? slug.trim() : nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newSub = {
      id: `sub-${subSlug}-${Date.now().toString().slice(-4)}`,
      nameEn: nameEn.trim(),
      nameBn: nameBn ? nameBn.trim() : nameEn.trim(),
      slug: subSlug,
      descriptionEn: descriptionEn || "",
      descriptionBn: descriptionBn || "",
      image: image || "",
      isFeatured: Boolean(isFeatured),
      parentSlug: parent.slug,
    };

    parent.subcategories.push(newSub);

    try {
      if (isMongoConnected()) {
        await CategoryModel.findOneAndUpdate(
          { $or: [{ id: parent.id }, { slug: parent.slug }] },
          { $push: { subcategories: newSub } },
          { new: true }
        );
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB createSubcategory error:", err?.message);
    }

    res.status(201).json({ success: true, data: newSub, message: "Sub-category created successfully" });
  },

  // PUT /api/v1/categories/:categoryId/subcategories/:subId - Update Subcategory
  async updateSubcategory(req: Request, res: Response): Promise<void> {
    const { categoryId, subId } = req.params;
    const { nameEn, nameBn, slug, descriptionEn, descriptionBn, image, isFeatured } = req.body;

    const parent = dbStore.categories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (!parent) {
      res.status(404).json({ success: false, message: "Parent category not found" });
      return;
    }

    const subIndex = parent.subcategories.findIndex((s) => s.id === subId || s.slug === subId);
    if (subIndex === -1) {
      res.status(404).json({ success: false, message: "Sub-category not found" });
      return;
    }

    const currentSub = parent.subcategories[subIndex];
    const updatedSub = {
      ...currentSub,
      nameEn: nameEn !== undefined ? nameEn.trim() : currentSub.nameEn,
      nameBn: nameBn !== undefined ? nameBn.trim() : currentSub.nameBn,
      slug: slug !== undefined ? slug.trim() : currentSub.slug,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : currentSub.descriptionEn,
      descriptionBn: descriptionBn !== undefined ? descriptionBn : currentSub.descriptionBn,
      image: image !== undefined ? image : currentSub.image,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : currentSub.isFeatured,
    };

    parent.subcategories[subIndex] = updatedSub;

    try {
      if (isMongoConnected()) {
        await CategoryModel.findOneAndUpdate(
          { $or: [{ id: parent.id }, { slug: parent.slug }], "subcategories.id": subId },
          { $set: { "subcategories.$": updatedSub } },
          { new: true }
        );
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB updateSubcategory error:", err?.message);
    }

    res.json({ success: true, data: updatedSub, message: "Sub-category updated successfully" });
  },

  // DELETE /api/v1/categories/:categoryId/subcategories/:subId - Delete Subcategory
  async deleteSubcategory(req: Request, res: Response): Promise<void> {
    const { categoryId, subId } = req.params;

    const parent = dbStore.categories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (!parent) {
      res.status(404).json({ success: false, message: "Parent category not found" });
      return;
    }

    const subIndex = parent.subcategories.findIndex((s) => s.id === subId || s.slug === subId);
    if (subIndex === -1) {
      res.status(404).json({ success: false, message: "Sub-category not found" });
      return;
    }

    const deleted = parent.subcategories.splice(subIndex, 1)[0];

    try {
      if (isMongoConnected()) {
        await CategoryModel.findOneAndUpdate(
          { $or: [{ id: parent.id }, { slug: parent.slug }] },
          { $pull: { subcategories: { $or: [{ id: subId }, { slug: subId }] } } },
          { new: true }
        );
      }
    } catch (err: any) {
      console.warn("[CategoryController] MongoDB deleteSubcategory error:", err?.message);
    }

    res.json({ success: true, data: deleted, message: "Sub-category deleted successfully" });
  },
};
