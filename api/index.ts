import type { Request, Response } from "express";
import dns from "dns";

// Ensure SRV resolution works in Vercel's Node.js environment
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

// Dynamic import so DB connection happens lazily per cold start
let appInstance: any = null;
let isDbConnected = false;

export default async function handler(req: Request, res: Response) {
  if (!appInstance) {
    const { default: app } = await import("../backend/src/server.js");
    appInstance = app;
  }

  if (!isDbConnected) {
    try {
      const { connectDatabase } = await import("../backend/src/config/db.js");
      await connectDatabase();
      isDbConnected = true;
    } catch (e: any) {
      console.warn("[Vercel] MongoDB connection warning:", e?.message);
    }
  }

  return appInstance(req, res);
}
