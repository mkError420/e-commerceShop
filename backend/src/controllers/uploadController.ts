import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { ENV } from "../config/env";

export const uploadController = {
  async handleUpload(req: Request, res: Response): Promise<void> {
    try {
      const urlInput = req.body?.url ? String(req.body.url).trim() : null;

      if (!req.file && !urlInput) {
        res.status(400).json({
          success: false,
          message: "No image file or URL provided. Please attach an image file or provide a valid image URL.",
        });
        return;
      }

      const targetFolder = (req.body?.folder && String(req.body.folder).trim()) || "/products";

      // ─── 1. ImageKit.io Free Cloud CDN (User Preferred: 20GB Free Tier) ───
      if (ENV.IMAGEKIT.PRIVATE_KEY) {
        try {
          const formData = new FormData();
          const authHeader = `Basic ${Buffer.from(`${ENV.IMAGEKIT.PRIVATE_KEY}:`).toString("base64")}`;

          if (req.file) {
            const fileBuffer = fs.readFileSync(req.file.path);
            const base64File = fileBuffer.toString("base64");
            formData.append("file", base64File);
            formData.append("fileName", req.file.originalname);
          } else if (urlInput) {
            formData.append("file", urlInput);
            let cleanFileName = targetFolder.includes("banner") ? `banner_${Date.now()}.jpg` : "url_product.jpg";
            try {
              const urlPath = new URL(urlInput).pathname;
              cleanFileName = path.basename(urlPath) || cleanFileName;
            } catch {
              cleanFileName = `image_${Date.now()}.jpg`;
            }
            formData.append("fileName", cleanFileName);
          }

          formData.append("folder", targetFolder);
          formData.append("useUniqueFileName", "true");

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

            // Clean up temporary local file if any
            if (req.file?.path) {
              try {
                fs.unlinkSync(req.file.path);
              } catch {
                // ignore
              }
            }

            console.log(`✅ [ImageKit] Upload successful -> ${ikData.url}`);

            res.json({
              success: true,
              url: ikData.url,
              thumbnailUrl: ikData.thumbnailUrl,
              storage: "IMAGEKIT_FREE_CDN",
              filename: ikData.name || (req.file ? req.file.filename : "url_image"),
              size: ikData.size || (req.file ? req.file.size : 0),
              mimetype: req.file ? req.file.mimetype : "image/jpeg",
            });
            return;
          } else {
            const errText = await ikRes.text();
            console.warn("[ImageKit] Upload rejected by API:", ikRes.status, errText);
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
          if (req.file) {
            const fileBuffer = fs.readFileSync(req.file.path);
            const blob = new Blob([fileBuffer], { type: req.file.mimetype });
            formData.append("file", blob, req.file.originalname);
          } else if (urlInput) {
            formData.append("file", urlInput);
          }
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
            if (req.file?.path) {
              try {
                fs.unlinkSync(req.file.path);
              } catch {
                // ignore
              }
            }

            res.json({
              success: true,
              url: cdnData.secure_url,
              storage: "CLOUDINARY_FREE_CDN",
              filename: req.file ? req.file.filename : "url_image",
              size: req.file ? req.file.size : 0,
              mimetype: req.file ? req.file.mimetype : "image/jpeg",
            });
            return;
          }
        } catch (cErr: any) {
          console.warn("[Cloudinary] Upload exception:", cErr.message);
        }
      }

      // ─── 3. Local Free Storage (Zero config, served from Express static) ───
      if ((req as any).file) {
        const file = (req as any).file;
        const host = req.get("host") || `localhost:${ENV.PORT}`;
        const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
        const localUrl = `${protocol}://${host}/uploads/${file.filename}`;

        res.json({
          success: true,
          url: localUrl,
          storage: "LOCAL_SERVER_STORAGE",
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        });
        return;
      }

      // If only URL was given and cloud failed
      if (urlInput) {
        res.json({
          success: true,
          url: urlInput,
          storage: "LOCAL_SERVER_STORAGE",
          filename: "external_url",
          size: 0,
          mimetype: "image/jpeg",
        });
        return;
      }
    } catch (error: any) {
      console.error("[Upload] Error processing image upload:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
  },
};

/**
 * Direct ImageKit.io Cloud Upload helper for server-side operations
 */
export async function uploadToImageKitDirect(
  fileOrUrl: string,
  fileName: string = `banner_${Date.now()}.jpg`,
  folder: string = "/banners"
): Promise<{ success: boolean; url: string; fileId?: string } | null> {
  if (!ENV.IMAGEKIT.PRIVATE_KEY) return null;
  try {
    const formData = new FormData();
    const authHeader = `Basic ${Buffer.from(`${ENV.IMAGEKIT.PRIVATE_KEY}:`).toString("base64")}`;
    formData.append("file", fileOrUrl);
    formData.append("fileName", fileName);
    formData.append("folder", folder);
    formData.append("useUniqueFileName", "true");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: authHeader },
      body: formData,
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      console.log(`✅ [ImageKit Direct] Banner saved to ImageKit -> ${data.url}`);
      return { success: true, url: data.url, fileId: data.fileId };
    } else {
      const errText = await res.text();
      console.warn("[ImageKit Direct] Failed:", res.status, errText);
    }
  } catch (err: any) {
    console.warn("[ImageKit Direct] Upload error:", err.message);
  }
  return null;
}
