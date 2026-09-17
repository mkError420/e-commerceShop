import { Request, Response } from "express";
import { BannerModel } from "../models/Banner";
import { dbStore, StoredBanner, INITIAL_BANNERS } from "../config/inMemoryStore";
import { isDatabaseConnected } from "../config/db";
import { uploadToImageKitDirect } from "./uploadController";

export const bannerController = {
  // Get all banners (public: can filter activeOnly=true)
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { activeOnly } = req.query;
      let banners: any[] = [];

      if (isDatabaseConnected()) {
        try {
          const filter = activeOnly === "true" ? { isActive: true } : {};
          banners = await BannerModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
        } catch (dbErr) {
          console.warn("[MongoDB] Banners fetch error, falling back to inMemoryStore:", dbErr);
        }
      }

      if (!banners || banners.length === 0) {
        // Fallback to memory store
        let memBanners = [...dbStore.banners];
        if (activeOnly === "true") {
          memBanners = memBanners.filter((b) => b.isActive);
        }
        memBanners.sort((a, b) => a.sortOrder - b.sortOrder);
        banners = memBanners;
      }

      // Map format
      const formatted = banners.map((b: any) => ({
        id: b._id ? b._id.toString() : b.id,
        titleEn: b.titleEn,
        titleBn: b.titleBn || "",
        subtitleEn: b.subtitleEn,
        subtitleBn: b.subtitleBn || "",
        ctaEn: b.ctaEn || "Explore Collection",
        ctaBn: b.ctaBn || "কালেকশন দেখুন",
        link: b.link || "/shop",
        secondaryCtaEn: b.secondaryCtaEn || "Browse All",
        secondaryCtaBn: b.secondaryCtaBn || "সব দেখুন",
        secondaryLink: b.secondaryLink || "/shop",
        bgImage: b.bgImage,
        tag: b.tag || "Featured",
        isActive: b.isActive !== false,
        sortOrder: b.sortOrder || 0,
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      }));

      res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error: any) {
      console.error("Get Banners Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get single banner by ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let banner: any = null;

      if (isDatabaseConnected()) {
        try {
          banner = await BannerModel.findById(id).lean();
        } catch {}
      }

      if (!banner) {
        banner = dbStore.banners.find((b) => b.id === id);
      }

      if (!banner) {
        res.status(404).json({ success: false, message: "Banner not found" });
        return;
      }

      res.json({
        success: true,
        data: {
          id: banner._id ? banner._id.toString() : banner.id,
          ...banner,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create new banner
  async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        titleEn,
        titleBn,
        subtitleEn,
        subtitleBn,
        ctaEn,
        ctaBn,
        link,
        secondaryCtaEn,
        secondaryCtaBn,
        secondaryLink,
        bgImage,
        tag,
        isActive,
        sortOrder,
      } = req.body;

      if (!titleEn || !subtitleEn || !bgImage) {
        res.status(400).json({
          success: false,
          message: "Title (EN), Subtitle (EN), and Background Image URL are required.",
        });
        return;
      }

      // Auto-save external images or base64 uploads directly to ImageKit.io
      let finalBgImage = String(bgImage).trim();
      if (
        !finalBgImage.includes("ik.imagekit.io") &&
        (finalBgImage.startsWith("http") || finalBgImage.startsWith("data:image/"))
      ) {
        try {
          const ikRes = await uploadToImageKitDirect(
            finalBgImage,
            `banner_${Date.now()}.jpg`,
            "/banners"
          );
          if (ikRes && ikRes.url) {
            finalBgImage = ikRes.url;
            console.log(`✅ [Banner] Background image saved to ImageKit CDN: ${finalBgImage}`);
          }
        } catch (ikErr: any) {
          console.warn("[Banner] ImageKit auto-upload warning:", ikErr?.message);
        }
      }

      const calculatedSortOrder = typeof sortOrder === "number" ? sortOrder : dbStore.banners.length + 1;
      let savedDbBanner: any = null;

      if (isDatabaseConnected()) {
        try {
          savedDbBanner = await BannerModel.create({
            titleEn: String(titleEn).trim(),
            titleBn: titleBn ? String(titleBn).trim() : "",
            subtitleEn: String(subtitleEn).trim(),
            subtitleBn: subtitleBn ? String(subtitleBn).trim() : "",
            ctaEn: ctaEn ? String(ctaEn).trim() : "Explore Collection",
            ctaBn: ctaBn ? String(ctaBn).trim() : "কালেকশন দেখুন",
            link: link ? String(link).trim() : "/shop",
            secondaryCtaEn: secondaryCtaEn ? String(secondaryCtaEn).trim() : "Browse All",
            secondaryCtaBn: secondaryCtaBn ? String(secondaryCtaBn).trim() : "সব দেখুন",
            secondaryLink: secondaryLink ? String(secondaryLink).trim() : "/shop",
            bgImage: finalBgImage,
            tag: tag ? String(tag).trim() : "Featured Collection",
            isActive: isActive !== false,
            sortOrder: calculatedSortOrder,
          });
          console.log("✅ [MongoDB] New banner created:", savedDbBanner._id);
        } catch (dbErr: any) {
          console.warn("[MongoDB] Create banner warning:", dbErr.message);
        }
      }

      const bannerId = savedDbBanner?._id?.toString() || `banner-${Date.now()}`;
      const newStoredBanner: StoredBanner = {
        id: bannerId,
        titleEn: String(titleEn).trim(),
        titleBn: titleBn ? String(titleBn).trim() : "",
        subtitleEn: String(subtitleEn).trim(),
        subtitleBn: subtitleBn ? String(subtitleBn).trim() : "",
        ctaEn: ctaEn ? String(ctaEn).trim() : "Explore Collection",
        ctaBn: ctaBn ? String(ctaBn).trim() : "কালেকশন দেখুন",
        link: link ? String(link).trim() : "/shop",
        secondaryCtaEn: secondaryCtaEn ? String(secondaryCtaEn).trim() : "Browse All",
        secondaryCtaBn: secondaryCtaBn ? String(secondaryCtaBn).trim() : "সব দেখুন",
        secondaryLink: secondaryLink ? String(secondaryLink).trim() : "/shop",
        bgImage: finalBgImage,
        tag: tag ? String(tag).trim() : "Featured Collection",
        isActive: isActive !== false,
        sortOrder: calculatedSortOrder,
        createdAt: new Date().toISOString(),
      };

      dbStore.banners.push(newStoredBanner);

      res.status(201).json({
        success: true,
        message: "Home banner created and saved successfully!",
        data: newStoredBanner,
      });
    } catch (error: any) {
      console.error("Create Banner Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update banner
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (!id) {
        res.status(400).json({ success: false, message: "Banner ID is required" });
        return;
      }

      // Auto-save external images or base64 uploads directly to ImageKit.io
      if (
        updateData.bgImage &&
        !updateData.bgImage.includes("ik.imagekit.io") &&
        (updateData.bgImage.startsWith("http") || updateData.bgImage.startsWith("data:image/"))
      ) {
        try {
          const ikRes = await uploadToImageKitDirect(
            updateData.bgImage,
            `banner_${Date.now()}.jpg`,
            "/banners"
          );
          if (ikRes && ikRes.url) {
            updateData.bgImage = ikRes.url;
            console.log(`✅ [Banner Update] Background image saved to ImageKit CDN: ${updateData.bgImage}`);
          }
        } catch (ikErr: any) {
          console.warn("[Banner Update] ImageKit auto-upload warning:", ikErr?.message);
        }
      }

      if (isDatabaseConnected()) {
        try {
          await BannerModel.findByIdAndUpdate(id, { $set: updateData });
        } catch (dbErr) {
          console.warn("[MongoDB] Update banner warning:", dbErr);
        }
      }

      // Update in memory store
      dbStore.banners = dbStore.banners.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            ...updateData,
          };
        }
        return b;
      });

      res.json({
        success: true,
        message: "Banner updated successfully!",
        data: updateData,
      });
    } catch (error: any) {
      console.error("Update Banner Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete banner
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: "Banner ID is required" });
        return;
      }

      if (isDatabaseConnected()) {
        try {
          await BannerModel.findByIdAndDelete(id);
        } catch (dbErr) {
          console.warn("[MongoDB] Delete banner warning:", dbErr);
        }
      }

      dbStore.banners = dbStore.banners.filter((b) => b.id !== id);

      res.json({
        success: true,
        message: "Banner removed successfully!",
      });
    } catch (error: any) {
      console.error("Delete Banner Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Toggle active / inactive status
  async toggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let newActiveState = true;

      if (isDatabaseConnected()) {
        try {
          const doc = await BannerModel.findById(id);
          if (doc) {
            doc.isActive = !doc.isActive;
            await doc.save();
            newActiveState = doc.isActive;
          }
        } catch {}
      }

      const memDoc = dbStore.banners.find((b) => b.id === id);
      if (memDoc) {
        memDoc.isActive = !memDoc.isActive;
        newActiveState = memDoc.isActive;
      }

      res.json({
        success: true,
        isActive: newActiveState,
        message: newActiveState ? "Banner activated on storefront" : "Banner hidden from storefront",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
