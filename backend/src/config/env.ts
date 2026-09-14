import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret_shorobor_bd_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
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
