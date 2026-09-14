import type { Request, Response } from "express";
import dns from "dns";
import app from "../backend/src/server";
import { connectDatabase } from "../backend/src/config/db";

// Ensure SRV resolution works in Vercel's Node.js environment
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

let isDbConnected = false;

export default async function handler(req: Request, res: Response) {
  if (!isDbConnected) {
    try {
      await connectDatabase();
      isDbConnected = true;
    } catch (e: any) {
      console.warn("[Vercel] MongoDB connection warning:", e?.message);
    }
  }

  return app(req, res);
}
