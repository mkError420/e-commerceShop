import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "https://ffashion.netlify.app",
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret_shorobor_bd_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Free Cloud Image CDN (ImageKit.io - 20GB Free Tier)
  IMAGEKIT: {
    PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || "public_112wWNO7wzKDPxH/KSrRxN9ZPxs=",
    PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || "private_obTdlg7gNhOfjcLJ5SFveRBg+hs=",
    URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/mha5hytnj",
  },

  // Free Cloud Image CDN (Cloudinary - Optional)
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    API_KEY: process.env.CLOUDINARY_API_KEY || "",
    API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
    UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || "",
  },
  
  // MongoDB Database Configuration
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://rushda00410_db_user:GVPx5gtfG4AQuQln@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce?retryWrites=true&w=majority&appName=Cluster0",
  
  // Bangladeshi Payment Gateways
  BKASH: {
    APP_KEY: process.env.BKASH_APP_KEY || "sandbox_app_key",
    APP_SECRET: process.env.BKASH_APP_SECRET || "sandbox_app_secret",
    USERNAME: process.env.BKASH_USERNAME || "sandbox_user",
    PASSWORD: process.env.BKASH_PASSWORD || "sandbox_password",
    BASE_URL: process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v2.0",
  },
  
  NAGAD: {
    MERCHANT_ID: process.env.NAGAD_MERCHANT_ID || "683002007104250",
    PUBLIC_KEY: process.env.NAGAD_PUBLIC_KEY || "",
    PRIVATE_KEY: process.env.NAGAD_PRIVATE_KEY || "",
  },

  SSLCOMMERZ: {
    STORE_ID: process.env.SSLCOMMERZ_STORE_ID || "testbox",
    STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty",
    IS_SANDBOX: process.env.SSLCOMMERZ_IS_SANDBOX !== "false",
  },

  COURIER: {
    INSIDE_DHAKA_RATE: parseInt(process.env.INSIDE_DHAKA_RATE || "70", 10),
    OUTSIDE_DHAKA_RATE: parseInt(process.env.OUTSIDE_DHAKA_RATE || "130", 10),
  },
};
