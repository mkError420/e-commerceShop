import { Request, Response } from "express";
import { dbStore, StoredCategory } from "../config/inMemoryStore";

export const categoryController = {
  // GET /api/v1/categories - Hierarchical list
  async getAll(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: dbStore.categories,
    });
  },

  // GET /api/v1/categories/:slug - Single category with subcategories
  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const cat = dbStore.categories.find((c) => c.slug === slug);

    if (!cat) {
      // Check if it's a subcategory
      for (const parent of dbStore.categories) {
        const sub = parent.subcategories.find((s) => s.slug === slug);
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
      res.status(400).json({ success: false, message: "Category name is required" });
      return;
    }

    const catSlug = slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (parentSlug) {
      const parent = dbStore.categories.find((c) => c.slug === parentSlug);
      if (!parent) {
        res.status(404).json({ success: false, message: `Parent category '${parentSlug}' not found` });
        return;
      }

      const newSub = {
        id: `sub-${Date.now()}`,
        nameEn,
        nameBn,
        slug: catSlug,
        descriptionEn,
        descriptionBn,
        image,
        isFeatured: Boolean(isFeatured),
        parentSlug,
      };

      parent.subcategories.push(newSub);
      res.status(201).json({ success: true, data: newSub });
      return;
    }

    const newCategory: StoredCategory = {
      id: `cat-${Date.now()}`,
      nameEn,
      nameBn,
      slug: catSlug,
      descriptionEn,
      descriptionBn,
      image,
      isFeatured: Boolean(isFeatured),
      subcategories: [],
    };

    dbStore.categories.push(newCategory);
    res.status(201).json({ success: true, data: newCategory });
  },
};
