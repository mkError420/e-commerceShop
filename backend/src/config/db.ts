import mongoose from "mongoose";
import { ENV } from "./env";
import { dbStore } from "./inMemoryStore";

export async function connectDatabase() {
  console.log(`[Database] Initializing MongoDB connection in ${ENV.NODE_ENV} mode...`);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB] Local daemon not reachable (${error.message}).`);
    console.log(`⚡ [Database] Using High-Performance In-Memory Data Store loaded with ${dbStore.products.length} Bangladeshi heritage products & orders.`);
  }
}
