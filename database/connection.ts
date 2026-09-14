import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from root or backend
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bangladesh_ecommerce";

let isConnected = false;

export async function connectMongoDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
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
