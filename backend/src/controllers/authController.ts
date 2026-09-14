import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { dbStore, StoredUser } from "../config/inMemoryStore";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const authController = {
  // Login with phone or email
  async login(req: Request, res: Response): Promise<void> {
    const { identifier, password } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, message: "Phone or Email is required" });
      return;
    }

    let user = dbStore.users.find(
      (u) => u.phone === identifier || (u.email && u.email.toLowerCase() === identifier.toLowerCase())
    );

    // If user doesn't exist, create customer on the fly (BD rapid phone checkout pattern)
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: identifier.startsWith("01") ? `Customer ${identifier.slice(-4)}` : identifier.split("@")[0],
        phone: identifier.startsWith("01") ? identifier : "01700000000",
        email: identifier.includes("@") ? identifier : undefined,
        passwordHash: "mock_hash",
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      };
      dbStore.users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role, email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  },

  // Register a new customer
  async register(req: Request, res: Response): Promise<void> {
    const { name, phone, email, password } = req.body;
    if (!name || !phone) {
      res.status(400).json({ success: false, message: "Name and Phone number are required" });
      return;
    }

    const existing = dbStore.users.find((u) => u.phone === phone);
    if (existing) {
      res.status(409).json({ success: false, message: "A user with this mobile number already exists" });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name,
      phone,
      email,
      passwordHash: password || "mock_hash",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    };
    dbStore.users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, phone: newUser.phone, role: newUser.role, email: newUser.email },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
      },
    });
  },

  // Get current logged-in user
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = dbStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  },
};
