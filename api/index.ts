import type { Request, Response } from "express";
import dns from "dns";
import app from "../backend/src/server";
import { connectDatabase } from "../backend/src/config/db";

// Ensure SRV resolution works in Vercel's Node.js environment
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

let isDbConnected = false;

async function ensureDb() {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (e: any) {
      console.warn("[Vercel] MongoDB connection warning:", e?.message);
    }
  }
}

export default async function handler(req: Request, res: Response) {
  // Normalize URL in case Vercel rewrote /api/... to /...
  if (req.url) {
    if (!req.url.startsWith("/api") && req.url.startsWith("/v1")) {
      req.url = `/api${req.url}`;
    }
  }

  // Connect DB in background without blocking if slow
  await Promise.race([
    ensureDb(),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);

  return new Promise<void>((resolve) => {
    res.on("finish", resolve);
    res.on("close", resolve);
    try {
      app(req, res);
    } catch (err: any) {
      console.error("[Vercel] Error executing request:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
      resolve();
    }
  });
}
