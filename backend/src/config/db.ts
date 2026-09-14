import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "./env";
import { dbStore } from "./inMemoryStore";

// Configure reliable DNS servers for SRV resolution on Windows/local networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if unable to set custom DNS servers
}

export async function connectDatabase() {
  console.log(`[Database] Initializing MongoDB connection in ${ENV.NODE_ENV} mode...`);

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ [MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB] Connection failed (${error.message}).`);
    console.log(`⚡ [Database] Using High-Performance In-Memory Data Store loaded with ${dbStore.products.length} Bangladeshi heritage products & orders.`);
  }
}
