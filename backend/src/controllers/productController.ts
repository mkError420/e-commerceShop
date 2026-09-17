import { Request, Response } from "express";
import { dbStore, StoredProduct } from "../config/inMemoryStore";

export const productController = {
  // GET /api/v1/products - Filterable catalog
  async getAll(req: Request, res: Response): Promise<void> {
    const { category, subCategory, search, minPrice, maxPrice, sort } = req.query;

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
      // Default: newest
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      total: items.length,
      data: items,
    });
  },

  // GET /api/v1/products/:slugOrId - Single product
  async getBySlugOrId(req: Request, res: Response): Promise<void> {
    const { slugOrId } = req.params;
    const product = dbStore.products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );

    if (!product) {
      res.status(404).json({ success: false, message: `Product not found: ${slugOrId}` });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  },

  // POST /api/v1/products - Create product (Admin)
  async create(req: Request, res: Response): Promise<void> {
    const body = req.body;
    const regularPrice = body.regularPrice ?? body.priceBDT;
    const category = body.category ?? body.categorySlug;

    if (!body.nameEn || !regularPrice || !category) {
      res.status(400).json({ success: false, message: "nameEn, price (regularPrice/priceBDT), and category (category/categorySlug) are required" });
      return;
    }

    const slug = body.slug || body.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const sku = body.sku || `SKU-${Date.now().toString(36).toUpperCase()}`;
    const stock = Number(body.stock ?? body.stockQuantity ?? 10);
    const salePrice = body.salePrice ?? body.compareAtPriceBDT ? Number(body.salePrice ?? body.compareAtPriceBDT) : undefined;

    const newProduct: StoredProduct = {
      id: body.id || `prod-${Date.now()}`,
      nameEn: body.nameEn,
      nameBn: body.nameBn,
      slug,
      sku,
      descriptionEn: body.descriptionEn || "",
      descriptionBn: body.descriptionBn,
      category,
      subCategory: body.subCategory ?? body.subcategorySlug,
      regularPrice: Number(regularPrice),
      salePrice,
      stock,
      dhakaHubStock: Number(body.dhakaHubStock || Math.floor(stock * 0.6)),
      chittagongHubStock: Number(body.chittagongHubStock || Math.floor(stock * 0.4)),
      images: body.images && body.images.length ? body.images : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop"],
      sizes: body.sizes || ["Standard"],
      colors: body.colors || [{ name: "Standard", hex: "#1A1A1A" }],
      isFeatured: Boolean(body.isFeatured),
      isFlashDeal: Boolean(body.isFlashDeal),
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    dbStore.products.unshift(newProduct);

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  },

  // PATCH /api/v1/products/:id - Update product
  async update(req: Request, res: Response): Promise<void> {
    const { slugOrId } = req.params;
    const index = dbStore.products.findIndex((p) => p.id === slugOrId || p.slug === slugOrId);

    if (index === -1) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    dbStore.products[index] = {
      ...dbStore.products[index],
      ...req.body,
      id: dbStore.products[index].id, // preserve id
    };

    res.json({
      success: true,
      data: dbStore.products[index],
    });
  },

  // DELETE /api/v1/products/:id - Delete product
  async delete(req: Request, res: Response): Promise<void> {
    const { slugOrId } = req.params;
    const index = dbStore.products.findIndex((p) => p.id === slugOrId || p.slug === slugOrId);

    if (index === -1) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const removed = dbStore.products.splice(index, 1)[0];
    res.json({
      success: true,
      message: `Product '${removed.nameEn}' deleted successfully`,
    });
  },
};
