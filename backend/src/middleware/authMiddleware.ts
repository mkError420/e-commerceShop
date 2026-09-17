import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { dbStore } from "../config/inMemoryStore";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone: string;
    role: "ADMIN" | "CUSTOMER" | "MANAGER";
    email?: string;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (ENV.NODE_ENV === "development") {
      req.user = {
        id: "admin-dev-id",
        phone: "01700000000",
        role: "ADMIN",
        email: "mk.rabbani.cse@gmail.com",
      };
      return next();
    }
    res.status(401).json({ success: false, message: "Authentication required. Bearer token missing." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      phone: string;
      role: "ADMIN" | "CUSTOMER" | "MANAGER";
      email?: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    if (ENV.NODE_ENV === "development") {
      req.user = {
        id: "admin-dev-id",
        phone: "01700000000",
        role: "ADMIN",
        email: "mk.rabbani.cse@gmail.com",
      };
      return next();
    }
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

export function requireRole(allowedRoles: Array<"ADMIN" | "CUSTOMER" | "MANAGER">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Access forbidden: Insufficient permissions." });
      return;
    }
    next();
  };
}
