import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "./env";
import { dbStore, StoredProduct, StoredCategory } from "./inMemoryStore";
import { ProductModel } from "../models/Product";
import { CategoryModel } from "../models/Category";
import { UserModel } from "../models/User";
import { CouponModel } from "../models/Coupon";
import { BannerModel } from "../models/Banner";

// Configure reliable DNS servers for SRV resolution on Windows/local networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if unable to set custom DNS servers
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDatabase() {
  console.log(`[Database] Initializing MongoDB connection in ${ENV.NODE_ENV} mode...`);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Synchronize & Seed MongoDB if collections are empty
    await syncAndSeedDatabase();
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB] Connection failed (${error.message}).`);
    console.log(`⚡ [Database] Using High-Performance In-Memory Data Store loaded with ${dbStore.products.length} Bangladeshi heritage products & orders.`);
  }
}

async function syncAndSeedDatabase() {
  try {
    // 1. Seed Categories if empty
    const categoryCount = await CategoryModel.countDocuments();
    if (categoryCount === 0 && dbStore.categories.length > 0) {
      console.log(`🌱 [MongoDB] Seeding ${dbStore.categories.length} categories...`);
      for (const cat of dbStore.categories) {
        await CategoryModel.create({
          id: cat.id,
          nameEn: cat.nameEn,
          nameBn: cat.nameBn || cat.nameEn,
          slug: cat.slug,
          descriptionEn: cat.descriptionEn || "",
          descriptionBn: cat.descriptionBn || "",
          image: cat.image || "",
          isFeatured: cat.isFeatured ?? true,
          subcategories: cat.subcategories || [],
        });
      }
      console.log("✅ [MongoDB] Categories successfully seeded.");
    }

    // 2. Seed Products if empty
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0 && dbStore.products.length > 0) {
      console.log(`🌱 [MongoDB] Seeding ${dbStore.products.length} Bangladeshi heritage products...`);
      for (const p of dbStore.products) {
        await ProductModel.create({
          id: p.id,
          sku: p.sku,
          nameEn: p.nameEn,
          nameBn: p.nameBn || "",
          slug: p.slug,
          descriptionEn: p.descriptionEn || "",
          descriptionBn: p.descriptionBn || "",
          priceBDT: p.salePrice || p.regularPrice,
          compareAtPriceBDT: p.salePrice ? p.regularPrice : undefined,
          costPriceBDT: Math.round((p.salePrice || p.regularPrice) * 0.6),
          categorySlug: p.category,
          categoryNameEn: p.category,
          subcategorySlug: p.subCategory,
          stockQuantity: p.stock,
          dhakaHubStock: p.dhakaHubStock || Math.floor(p.stock * 0.6),
          chittagongHubStock: p.chittagongHubStock || Math.floor(p.stock * 0.4),
          images: p.images,
          fabricType: "Pure Handloom Khadi & Silk",
          craftsmanship: "Authentic Bangladeshi Artisan Weave",
          sizes: p.sizes,
          colors: p.colors,
          rating: p.rating || 5.0,
          reviewsCount: p.reviewCount || 0,
          isFeatured: Boolean(p.isFeatured),
          isFlashDeal: Boolean(p.isFlashDeal),
        });
      }
      console.log("✅ [MongoDB] Products successfully seeded.");
    }

    // 3. Seed Default Admin if missing
    const adminUser = await UserModel.findOne({
      $or: [
        { email: "mk.rabbani.cse@gmail.com" },
        { email: "admin@shorobor.com.bd" },
      ],
    });
    if (!adminUser) {
      console.log("🌱 [MongoDB] Seeding Super Administrator account...");
      await UserModel.create({
        name: "Shop Admin (Golam Rabbani)",
        phone: "01700000000",
        email: "mk.rabbani.cse@gmail.com",
        passwordHash: "$2a$10$w8.25o64yLdZg21c0e35u.98sH/sFfQ06G.Xf409kI0Yg2n",
        role: "ADMIN",
      });
      console.log("✅ [MongoDB] Super Admin created: mk.rabbani.cse@gmail.com");
    }

    // 4. Seed Coupons if empty
    const couponCount = await CouponModel.countDocuments();
    if (couponCount === 0 && dbStore.coupons.length > 0) {
      console.log(`🌱 [MongoDB] Seeding ${dbStore.coupons.length} coupons...`);
      for (const cp of dbStore.coupons) {
        await CouponModel.create({
          code: cp.code,
          type: cp.discountType === "PERCENT" ? "PERCENTAGE" : "FIXED_BDT",
          value: cp.discountValue,
          minSpendBDT: cp.minSpend,
          maxDiscount: cp.maxDiscount,
          isActive: cp.isActive,
          description: `Enjoy ৳${cp.discountValue} discount on your order`,
        });
      }
      console.log("✅ [MongoDB] Coupons successfully seeded.");
    }

    // 5. Seed Banners if empty
    const bannerCount = await BannerModel.countDocuments();
    if (bannerCount === 0 && dbStore.banners.length > 0) {
      console.log(`🌱 [MongoDB] Seeding ${dbStore.banners.length} home banners...`);
      for (const b of dbStore.banners) {
        await BannerModel.create({
          titleEn: b.titleEn,
          titleBn: b.titleBn || "",
          subtitleEn: b.subtitleEn,
          subtitleBn: b.subtitleBn || "",
          ctaEn: b.ctaEn,
          ctaBn: b.ctaBn || "",
          link: b.link,
          secondaryCtaEn: b.secondaryCtaEn || "Browse All",
          secondaryCtaBn: b.secondaryCtaBn || "সব দেখুন",
          secondaryLink: b.secondaryLink || "/shop",
          bgImage: b.bgImage,
          tag: b.tag,
          isActive: b.isActive,
          sortOrder: b.sortOrder,
        });
      }
      console.log("✅ [MongoDB] Home banners successfully seeded.");
    }
  } catch (err: any) {
    console.warn("⚠️ [MongoDB] Sync/Seed notice:", err.message);
  }
}
