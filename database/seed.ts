// MongoDB Database Seeder for Bangladeshi E-Commerce
// Run with: npm run seed:db

import fs from "fs";
import path from "path";
import { connectMongoDB, disconnectMongoDB } from "./connection";
import { CategoryModel } from "./models/Category";
import { ProductModel } from "./models/Product";
import { CouponModel } from "./models/Coupon";
import { UserModel } from "./models/User";

async function seedDatabase() {
  console.log("🌱 [MongoDB Seeder] Initializing database seeding...");

  try {
    await connectMongoDB();

    const dataDir = path.join(__dirname, "data");
    const categories = JSON.parse(fs.readFileSync(path.join(dataDir, "categories.json"), "utf-8"));
    const products = JSON.parse(fs.readFileSync(path.join(dataDir, "products.json"), "utf-8"));
    const coupons = JSON.parse(fs.readFileSync(path.join(dataDir, "coupons.json"), "utf-8"));

    console.log("🧹 Cleaning old collections...");
    await Promise.all([
      CategoryModel.deleteMany({}),
      ProductModel.deleteMany({}),
      CouponModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);

    console.log(`📥 Inserting ${categories.length} Categories...`);
    for (const cat of categories) {
      await CategoryModel.create({
        nameEn: cat.nameEn,
        nameBn: cat.nameBn,
        slug: cat.slug,
        descriptionEn: cat.descriptionEn,
        descriptionBn: cat.descriptionBn,
        image: cat.image,
        isFeatured: cat.isFeatured,
      });

      if (cat.subcategories && cat.subcategories.length) {
        for (const sub of cat.subcategories) {
          await CategoryModel.create({
            nameEn: sub.nameEn,
            nameBn: sub.nameBn,
            slug: sub.slug,
            descriptionEn: sub.descriptionEn,
            descriptionBn: sub.descriptionBn,
            image: sub.image,
            isFeatured: sub.isFeatured,
          });
        }
      }
    }

    console.log(`📥 Inserting ${products.length} Bangladeshi Heritage Products (Jamdani, Panjabi, Crafts)...`);
    for (const prod of products) {
      await ProductModel.create({
        sku: prod.sku,
        nameEn: prod.nameEn,
        nameBn: prod.nameBn,
        slug: prod.slug,
        descriptionEn: prod.descriptionEn,
        descriptionBn: prod.descriptionBn,
        priceBDT: prod.salePrice || prod.regularPrice,
        compareAtPriceBDT: prod.salePrice ? prod.regularPrice : undefined,
        categorySlug: prod.category,
        subCategorySlug: prod.subCategory,
        stockQuantity: prod.stock,
        dhakaHubStock: prod.dhakaHubStock || Math.floor(prod.stock * 0.6),
        chittagongHubStock: prod.chittagongHubStock || Math.floor(prod.stock * 0.4),
        images: prod.images,
        sizes: prod.sizes,
        colors: prod.colors,
        isFeatured: prod.isFeatured,
        isFlashDeal: prod.isFlashDeal,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
      });
    }

    console.log(`📥 Inserting ${coupons.length} Promo Coupons (EID2026, BOISHAKH)...`);
    for (const cp of coupons) {
      await CouponModel.create(cp);
    }

    console.log("📥 Creating Super Administrator & Demo Customer...");
    await UserModel.create([
      {
        name: "Super Administrator",
        phone: "01700000000",
        email: "admin@shorobor.com.bd",
        role: "ADMIN",
        passwordHash: "$2a$10$w8.25o64yLdZg21c0e35u.98sH/sFfQ06G.Xf409kI0Yg2n",
      },
      {
        name: "Tanvir Rahman",
        phone: "01711000111",
        email: "tanvir.rahman@gmail.com",
        role: "CUSTOMER",
      },
    ]);

    console.log("🎉 [MongoDB Seeder] Database seeded successfully with authentic Bangladeshi data!");
  } catch (err: any) {
    console.error("❌ [MongoDB Seeder] Seeding encountered error:", err.message);
  } finally {
    await disconnectMongoDB();
  }
}

seedDatabase();
