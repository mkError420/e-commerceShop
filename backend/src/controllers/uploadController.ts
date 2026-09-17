import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { ENV } from "../config/env";

export const uploadController = {
  async handleUpload(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No image file provided. Please attach an image.",
        });
        return;
      }

      // ─── 1. ImageKit.io Free Cloud CDN (User Preferred: 20GB Free Tier) ───
      if (ENV.IMAGEKIT.PRIVATE_KEY) {
        try {
          const fileBuffer = fs.readFileSync(req.file.path);
          const base64File = fileBuffer.toString("base64");

          const formData = new FormData();
          formData.append("file", base64File);
          formData.append("fileName", req.file.originalname);
          formData.append("folder", "/products");
          formData.append("useUniqueFileName", "true");

          const authHeader = `Basic ${Buffer.from(`${ENV.IMAGEKIT.PRIVATE_KEY}:`).toString("base64")}`;

          const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            headers: {
              Authorization: authHeader,
            },
            body: formData,
          });

          if (ikRes.ok) {
            const ikData = (await ikRes.json()) as {
              url: string;
              thumbnailUrl?: string;
              fileId: string;
              name: string;
              size: number;
            };

            // Remove local temporary file
            try {
              fs.unlinkSync(req.file.path);
            } catch {
              // ignore
            }

            res.json({
              success: true,
              url: ikData.url,
              thumbnailUrl: ikData.thumbnailUrl,
              storage: "IMAGEKIT_FREE_CDN",
              filename: ikData.name || req.file.filename,
              size: ikData.size || req.file.size,
              mimetype: req.file.mimetype,
            });
            return;
          } else {
            const errText = await ikRes.text();
            console.warn("[ImageKit] Upload failed with status", ikRes.status, errText, "falling back...");
          }
        } catch (ikErr: any) {
          console.warn("[ImageKit] Upload error, falling back:", ikErr.message);
        }
      }

      // ─── 2. Cloudinary Free Cloud CDN (Fallback Cloud Option) ───
      if (
        ENV.CLOUDINARY.CLOUD_NAME &&
        ENV.CLOUDINARY.API_KEY &&
        ENV.CLOUDINARY.API_SECRET
      ) {
        try {
          const timestamp = Math.round(new Date().getTime() / 1000);
          const folder = "bangladesh-ecommerce/products";
          const signaturePayload = `folder=${folder}&timestamp=${timestamp}${ENV.CLOUDINARY.API_SECRET}`;
          const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");

          const formData = new FormData();
          const fileBuffer = fs.readFileSync(req.file.path);
          const blob = new Blob([fileBuffer], { type: req.file.mimetype });
          formData.append("file", blob, req.file.originalname);
          formData.append("api_key", ENV.CLOUDINARY.API_KEY);
          formData.append("timestamp", String(timestamp));
          formData.append("signature", signature);
          formData.append("folder", folder);

          const cdnRes = await fetch(
            `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY.CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (cdnRes.ok) {
            const cdnData = (await cdnRes.json()) as { secure_url: string; public_id: string };
            try {
              fs.unlinkSync(req.file.path);
            } catch {
              // ignore
            }

            res.json({
              success: true,
              url: cdnData.secure_url,
              storage: "CLOUDINARY_FREE_CDN",
              filename: req.file.filename,
              size: req.file.size,
              mimetype: req.file.mimetype,
            });
            return;
          }
        } catch (cErr: any) {
          console.warn("[Cloudinary] Upload exception:", cErr.message);
        }
      }

      // ─── 3. Local Free Storage (Zero config, served from Express static) ───
      const host = req.get("host") || `localhost:${ENV.PORT}`;
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const localUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      res.json({
        success: true,
        url: localUrl,
        storage: "LOCAL_SERVER_STORAGE",
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error: any) {
      console.error("[Upload] Error processing image upload:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
  },
};
