import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
import path from "path";

// Ensure Node.js can resolve MongoDB SRV records regardless of local ISP/Windows DNS issues
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS cannot be set
}

// Load environment variables from root or backend
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rushda00410_db_user:GVPx5gtfG4AQuQln@cluster0.wgtk8cr.mongodb.net/bangladesh_ecommerce?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;

export async function connectMongoDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB] Connection failed (${error.message}). Running with in-memory fallback.`);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log("[MongoDB] Disconnected.");
}

export default connectMongoDB;
