import { Request, Response } from "express";
import mongoose from "mongoose";
import { dbStore, StoredProduct } from "../config/inMemoryStore";
import { ProductModel } from "../models/Product";
import { isDatabaseConnected } from "../config/db";

// Format product so both frontend (Product) and backend (StoredProduct) keys work seamlessly
function formatProductOutput(p: any): any {
  const price = p.priceBDT ?? p.regularPrice ?? 0;
  const comparePrice = p.compareAtPriceBDT ?? p.salePrice ?? undefined;
  const stock = p.stockQuantity ?? p.stock ?? 10;
  const catSlug = p.categorySlug ?? p.category ?? "general";

  return {
    id: p.id || p._id?.toString(),
    _id: p._id?.toString() || p.id,
    sku: p.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
    nameEn: p.nameEn,
    nameBn: p.nameBn || "",
    slug: p.slug,
    descriptionEn: p.descriptionEn || "",
    descriptionBn: p.descriptionBn || "",
    // Dual compatibility pricing
    priceBDT: price,
    compareAtPriceBDT: comparePrice,
    regularPrice: price,
    salePrice: comparePrice,
    costPriceBDT: p.costPriceBDT || Math.round(price * 0.6),
    // Dual compatibility category
    categorySlug: catSlug,
    category: catSlug,
    categoryNameEn: p.categoryNameEn || catSlug,
    categoryNameBn: p.categoryNameBn || catSlug,
    subcategorySlug: p.subcategorySlug ?? p.subCategory,
    subCategory: p.subcategorySlug ?? p.subCategory,
    subcategoryNameEn: p.subcategoryNameEn,
    subcategoryNameBn: p.subcategoryNameBn,
    // Dual compatibility stock
    stockQuantity: stock,
    stock: stock,
    lowStockAlert: p.lowStockAlert ?? 5,
    dhakaHubStock: p.dhakaHubStock ?? Math.floor(stock * 0.6),
    chittagongHubStock: p.chittagongHubStock ?? Math.floor(stock * 0.4),
    images: p.images && p.images.length > 0 ? p.images : ["https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg"],
    fabricType: p.fabricType || "Bangladeshi Handloom",
    craftsmanship: p.craftsmanship || "Artisan Craftsmanship",
    sizes: p.sizes || ["Standard"],
    colors: p.colors || [{ name: "Standard", hex: "#1A1A1A" }],
    rating: p.rating ?? 5.0,
    reviewsCount: p.reviewsCount ?? p.reviewCount ?? 0,
    isFeatured: Boolean(p.isFeatured),
    isFlashDeal: Boolean(p.isFlashDeal),
    flashDealEnd: p.flashDealEnd,
    variants: p.variants || [],
    reviews: p.reviews || [],
    tags: p.tags || [],
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export const productController = {
  // GET /api/v1/products - Filterable catalog
  async getAll(req: Request, res: Response): Promise<void> {
    const { category, subCategory, search, minPrice, maxPrice, sort } = req.query;

    try {
      if (isDatabaseConnected()) {
        const query: Record<string, any> = {};

        if (category) {
          query.$or = [
            { categorySlug: new RegExp(`^${category}$`, "i") },
            { category: new RegExp(`^${category}$`, "i") },
          ];
        }

        if (subCategory) {
          query.$or = [
            { subcategorySlug: new RegExp(`^${subCategory}$`, "i") },
            { subCategory: new RegExp(`^${subCategory}$`, "i") },
          ];
        }

        if (search) {
          const q = String(search).trim();
          query.$or = [
            { nameEn: { $regex: q, $options: "i" } },
            { nameBn: { $regex: q, $options: "i" } },
            { sku: { $regex: q, $options: "i" } },
            { descriptionEn: { $regex: q, $options: "i" } },
          ];
        }

        if (minPrice || maxPrice) {
          query.priceBDT = {};
          if (minPrice) query.priceBDT.$gte = Number(minPrice);
          if (maxPrice) query.priceBDT.$lte = Number(maxPrice);
        }

        let sortOption: Record<string, any> = { createdAt: -1 };
        if (sort === "price-asc") {
          sortOption = { priceBDT: 1 };
        } else if (sort === "price-desc") {
          sortOption = { priceBDT: -1 };
        } else if (sort === "rating") {
          sortOption = { rating: -1 };
        }

        const mongoProducts = await ProductModel.find(query).sort(sortOption).lean();

        if (mongoProducts && mongoProducts.length > 0) {
          const formatted = mongoProducts.map(formatProductOutput);
          res.json({
            success: true,
            total: formatted.length,
            data: formatted,
            source: "mongodb",
          });
          return;
        }
      }
    } catch (dbErr: any) {
      console.warn("[Products] MongoDB query notice, falling back to memory store:", dbErr?.message);
    }

    // In-memory fallback
    let items = [...dbStore.products];

    if (category) {
      items = items.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    if (subCategory) {
      items = items.filter((p) => p.subCategory?.toLowerCase() === String(subCategory).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.nameBn && p.nameBn.includes(q)) ||
          p.descriptionEn.toLowerCase().includes(q)
      );
    }

    if (minPrice) {
      items = items.filter((p) => (p.salePrice || p.regularPrice) >= Number(minPrice));
    }

    if (maxPrice) {
      items = items.filter((p) => (p.salePrice || p.regularPrice) <= Number(maxPrice));
    }

    if (sort === "price-asc") {
      items.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
    } else if (sort === "price-desc") {
      items.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
    } else if (sort === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    } else {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const formatted = items.map(formatProductOutput);
    res.json({
      success: true,
      total: formatted.length,
      data: formatted,
      source: "memory",
    });
  },

  // GET /api/v1/products/:slugOrId - Single product
  async getBySlugOrId(req: Request, res: Response): Promise<void> {
    const { slugOrId } = req.params;

    try {
      if (isDatabaseConnected()) {
        const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
        const query: Record<string, any> = {
          $or: [
            { slug: slugOrId },
            { id: slugOrId },
            ...(isObjectId ? [{ _id: slugOrId }] : []),
          ],
        };

        const prod = await ProductModel.findOne(query).lean();
        if (prod) {
          res.json({
            success: true,
            data: formatProductOutput(prod),
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn("[Products] MongoDB getBySlugOrId error:", err?.message);
    }

    const product = dbStore.products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );

    if (!product) {
      res.status(404).json({ success: false, message: `Product not found: ${slugOrId}` });
      return;
    }

    res.json({
      success: true,
      data: formatProductOutput(product),
    });
  },

  // POST /api/v1/products - Create product (Admin)
  async create(req: Request, res: Response): Promise<void> {
    const body = req.body;
    const regularPrice = body.priceBDT ?? body.regularPrice;
    const category = body.categorySlug ?? body.category;

    if (!body.nameEn || !regularPrice || !category) {
      res.status(400).json({
        success: false,
        message: "nameEn, price (priceBDT/regularPrice), and category (categorySlug/category) are required",
      });
      return;
    }

    const id = body.id || `prod-${Date.now()}`;
    const slug = body.slug || body.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const sku = body.sku || `SKU-${Date.now().toString(36).toUpperCase()}`;
    const stock = Number(body.stockQuantity ?? body.stock ?? 10);
    const salePrice = body.compareAtPriceBDT ?? body.salePrice ? Number(body.compareAtPriceBDT ?? body.salePrice) : undefined;
    const images = body.images && body.images.length ? body.images : ["https://ik.imagekit.io/mha5hytnj/products/catalog_product_1_YSc7FTrx3.jpg"];

    const newProductData = {
      id,
      sku,
      nameEn: body.nameEn,
      nameBn: body.nameBn || "",
      slug,
      descriptionEn: body.descriptionEn || "",
      descriptionBn: body.descriptionBn || "",
      priceBDT: Number(regularPrice),
      compareAtPriceBDT: salePrice,
      costPriceBDT: body.costPriceBDT ? Number(body.costPriceBDT) : Math.round(Number(regularPrice) * 0.6),
      categorySlug: category,
      categoryNameEn: body.categoryNameEn || category,
      categoryNameBn: body.categoryNameBn || category,
      subcategorySlug: body.subcategorySlug ?? body.subCategory,
      subcategoryNameEn: body.subcategoryNameEn,
      subcategoryNameBn: body.subcategoryNameBn,
      stockQuantity: stock,
      lowStockAlert: Number(body.lowStockAlert || 5),
      dhakaHubStock: Number(body.dhakaHubStock || Math.floor(stock * 0.6)),
      chittagongHubStock: Number(body.chittagongHubStock || Math.floor(stock * 0.4)),
      images,
      fabricType: body.fabricType || "Bangladeshi Handloom",
      craftsmanship: body.craftsmanship || "Artisan Craftsmanship",
      sizes: body.sizes || ["Standard"],
      colors: body.colors || [{ name: "Standard", hex: "#1A1A1A" }],
      rating: 5.0,
      reviewsCount: 0,
      isFeatured: Boolean(body.isFeatured),
      isFlashDeal: Boolean(body.isFlashDeal),
      flashDealEnd: body.flashDealEnd,
      variants: body.variants || [],
      reviews: body.reviews || [],
      tags: body.tags || [],
    };

    // 1. Save to MongoDB if connected
    let savedInDb = false;
    try {
      if (isDatabaseConnected()) {
        const created = await ProductModel.create(newProductData);
        savedInDb = true;
        console.log(`✅ [MongoDB] Product created in database: ${created.nameEn} (${created.sku})`);
      }
    } catch (dbErr: any) {
      console.warn("[MongoDB] Product create notice (using in-memory store):", dbErr?.message);
    }

    // 2. Also keep in-memory store updated
    const memoryProduct: StoredProduct = {
      id,
      nameEn: newProductData.nameEn,
      nameBn: newProductData.nameBn,
      slug: newProductData.slug,
      sku: newProductData.sku,
      descriptionEn: newProductData.descriptionEn,
      descriptionBn: newProductData.descriptionBn,
      category: newProductData.categorySlug,
      subCategory: newProductData.subcategorySlug,
      regularPrice: newProductData.priceBDT,
      salePrice: newProductData.compareAtPriceBDT,
      stock: newProductData.stockQuantity,
      dhakaHubStock: newProductData.dhakaHubStock,
      chittagongHubStock: newProductData.chittagongHubStock,
      images: newProductData.images,
      sizes: newProductData.sizes,
      colors: newProductData.colors,
      isFeatured: newProductData.isFeatured,
      isFlashDeal: newProductData.isFlashDeal,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    dbStore.products.unshift(memoryProduct);

    res.status(201).json({
      success: true,
      message: savedInDb ? "Product saved to database successfully" : "Product created",
      data: formatProductOutput(newProductData),
    });
  },

  // PATCH /api/v1/products/:slugOrId - Update product
  async update(req: Request, res: Response): Promise<void> {
    const { slugOrId } = req.params;
    const updates = req.body;

    // 1. Update in MongoDB
    let updatedInDb = false;
    try {
      if (isDatabaseConnected()) {
        const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
        const query: Record<string, any> = {
          $or: [
            { id: slugOrId },
            { slug: slugOrId },
            ...(isObjectId ? [{ _id: slugOrId }] : []),
          ],
        };

        const updatedDoc: any = await ProductModel.findOneAndUpdate(
          query,
          { $set: updates },
          { new: true }
        ).lean();

        if (updatedDoc) {
          updatedInDb = true;
          console.log(`✅ [MongoDB] Product updated in database: ${updatedDoc.nameEn}`);
        }
      }
    } catch (err: any) {
      console.warn("[MongoDB] Product update notice:", err?.message);
    }

    // 2. Update in memory store
    const index = dbStore.products.findIndex(
      (p) => p.id === slugOrId || p.slug === slugOrId
    );

    if (index !== -1) {
      dbStore.products[index] = {
        ...dbStore.products[index],
        ...updates,
        id: dbStore.products[index].id,
      };
    }

    const current = index !== -1 ? dbStore.products[index] : updates;

    res.json({
      success: true,
      message: updatedInDb ? "Product updated in database" : "Product updated",
      data: formatProductOutput(current),
    });
  },

  // DELETE /api/v1/products/:slugOrId - Delete product
  async delete(req: Request, res: Response): Promise<void> {
    const { slugOrId } = req.params;

    // 1. Delete from MongoDB
    try {
      if (isDatabaseConnected()) {
        const isObjectId = mongoose.Types.ObjectId.isValid(slugOrId);
        const query: Record<string, any> = {
          $or: [
            { id: slugOrId },
            { slug: slugOrId },
            ...(isObjectId ? [{ _id: slugOrId }] : []),
          ],
        };
        await ProductModel.findOneAndDelete(query);
        console.log(`✅ [MongoDB] Product removed from database: ${slugOrId}`);
      }
    } catch (err: any) {
      console.warn("[MongoDB] Product delete notice:", err?.message);
    }

    // 2. Delete from memory store
    const index = dbStore.products.findIndex(
      (p) => p.id === slugOrId || p.slug === slugOrId
    );

    if (index !== -1) {
      dbStore.products.splice(index, 1);
    }

    res.json({
      success: true,
      message: `Product '${slugOrId}' removed successfully`,
    });
  },
};
