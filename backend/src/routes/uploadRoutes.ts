import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadController } from "../controllers/uploadController";

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext || ".jpg"}`);
  },
});

// Allowed image formats
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .png, .webp, .gif, .svg, .avif) are allowed!"));
    }
  },
});

// Middleware to catch multer-specific errors (e.g. file too large)
const handleMulterError = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ success: false, message: "File is too large. Maximum size is 10MB." });
      return;
    }
    res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    return;
  }
  if (err) {
    res.status(400).json({ success: false, message: err.message || "Invalid file" });
    return;
  }
  next();
};

// Route: POST /api/v1/upload
router.post(
  "/",
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      return next();
    }
    upload.single("image")(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  uploadController.handleUpload
);

export default router;
