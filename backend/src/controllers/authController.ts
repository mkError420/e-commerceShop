import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ENV } from "../config/env";
import { dbStore, StoredUser } from "../config/inMemoryStore";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { UserModel } from "../models/User";
import { CustomerModel } from "../models/Customer";

export const authController = {
  // Login with phone or email and password
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;
      if (!identifier) {
        res.status(400).json({ success: false, message: "Phone or Email is required" });
        return;
      }

      const cleanId = String(identifier).trim();
      const cleanPass = password ? String(password).trim() : "";

      // 1. Try finding in MongoDB first
      let dbUser: any = null;
      try {
        dbUser = await UserModel.findOne({
          $or: [
            { phone: cleanId },
            { email: { $regex: new RegExp(`^${cleanId}$`, "i") } },
          ],
        });
      } catch (dbErr) {
        console.warn("[MongoDB Auth] Database lookup failed, falling back to memory store:", dbErr);
      }

      // 2. Check Admin bootstrap credentials if not yet in DB
      const isAdminEmail =
        cleanId.toLowerCase() === "admin@shorobor.com.bd" ||
        cleanId.toLowerCase() === "mk.rabbani.cse@gmail.com";
      const isAdminPhone = cleanId === "01700000000";
      const isAdminPassMatch =
        cleanPass === "admin123" || cleanPass === "Admin@2026!" || cleanPass === "sup123456123";

      if (!dbUser && (isAdminEmail || isAdminPhone) && isAdminPassMatch) {
        try {
          const hash = await bcrypt.hash(cleanPass, 10);
          dbUser = await UserModel.create({
            name:
              cleanId.toLowerCase() === "mk.rabbani.cse@gmail.com"
                ? "Shop Admin (Golam Rabbani)"
                : "Super Administrator",
            phone: isAdminPhone ? cleanId : "01700000000",
            email: isAdminEmail ? cleanId.toLowerCase() : "admin@shorobor.com.bd",
            passwordHash: hash,
            role: "ADMIN",
          });
          console.log("✅ [MongoDB] Admin user auto-initialized in database:", dbUser.email);
        } catch (createErr) {
          console.warn("[MongoDB] Admin auto-create skipped or failed:", createErr);
        }
      }

      // 3. Fallback to in-memory store if DB was unreachable or didn't return
      let memUser = dbStore.users.find(
        (u) =>
          u.phone === cleanId ||
          (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
      );

      // If neither exists and identifier is a valid 11-digit BD phone, auto-register customer (rapid phone checkout)
      if (!dbUser && !memUser) {
        if (cleanId.startsWith("01") && cleanId.length === 11) {
          const name = `Customer ${cleanId.slice(-4)}`;
          const hash = cleanPass ? await bcrypt.hash(cleanPass, 10) : undefined;
          try {
            dbUser = await UserModel.create({
              name,
              phone: cleanId,
              passwordHash: hash,
              role: "CUSTOMER",
            });
            // Also initialize rich customer profile in Customers collection
            await CustomerModel.findOneAndUpdate(
              { phone: cleanId },
              {
                name,
                phone: cleanId,
                passwordHash: hash || "mock_hash",
                role: "CUSTOMER",
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } catch (createErr) {
            console.warn("[MongoDB] Rapid customer creation fallback to memory:", createErr);
          }

          memUser = {
            id: dbUser?._id?.toString() || `usr-${Date.now()}`,
            name,
            phone: cleanId,
            passwordHash: hash || "mock_hash",
            role: "CUSTOMER",
            createdAt: new Date().toISOString(),
          };
          dbStore.users.push(memUser);
        }
      }

      // Evaluate found user
      const userRecord = dbUser
        ? {
            id: dbUser._id.toString(),
            name: dbUser.name,
            phone: dbUser.phone,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            role: dbUser.role as "ADMIN" | "CUSTOMER" | "MANAGER",
          }
        : memUser
        ? {
            id: memUser.id,
            name: memUser.name,
            phone: memUser.phone,
            email: memUser.email,
            passwordHash: memUser.passwordHash,
            role: memUser.role,
          }
        : null;

      if (!userRecord) {
        res.status(404).json({
          success: false,
          message: "No account found with this phone or email. Please register.",
        });
        return;
      }

      // Password verification if password was provided
      if (cleanPass && userRecord.passwordHash) {
        let isPassValid = false;
        if (userRecord.passwordHash.startsWith("$2a$") || userRecord.passwordHash.startsWith("$2b$")) {
          isPassValid = await bcrypt.compare(cleanPass, userRecord.passwordHash);
        } else {
          isPassValid = cleanPass === userRecord.passwordHash || userRecord.passwordHash === "mock_hash";
        }

        // Also allow admin override passwords
        if (!isPassValid && userRecord.role === "ADMIN" && isAdminPassMatch) {
          isPassValid = true;
        }

        if (!isPassValid) {
          res.status(401).json({
            success: false,
            message: "Incorrect password. Please try again.",
          });
          return;
        }
      }

      const token = jwt.sign(
        {
          id: userRecord.id,
          phone: userRecord.phone,
          role: userRecord.role,
          email: userRecord.email,
        },
        ENV.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          phone: userRecord.phone,
          email: userRecord.email,
          role: userRecord.role,
        },
      });
    } catch (error: any) {
      console.error("Auth Login Error:", error);
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  },

  // Register a new customer or admin directly into MongoDB database
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, email, password, role } = req.body;
      if (!name || !phone) {
        res.status(400).json({ success: false, message: "Name and Phone number are required" });
        return;
      }

      const cleanPhone = String(phone).trim();
      const cleanName = String(name).trim();
      const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;
      const targetRole: "ADMIN" | "CUSTOMER" | "MANAGER" =
        role === "ADMIN" ? "ADMIN" : role === "MANAGER" ? "MANAGER" : "CUSTOMER";

      // 1. Check if user already exists in MongoDB
      let existingInDb = null;
      try {
        existingInDb = await UserModel.findOne({
          $or: [
            { phone: cleanPhone },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        });
      } catch (dbErr) {
        console.warn("[MongoDB Auth] Existing user check failed:", dbErr);
      }

      const existingInMem = dbStore.users.find(
        (u) => u.phone === cleanPhone || (cleanEmail && u.email?.toLowerCase() === cleanEmail)
      );

      if (existingInDb || existingInMem) {
        res.status(409).json({
          success: false,
          message: "An account with this mobile number or email already exists. Please Sign In.",
        });
        return;
      }

      // Hash password if provided
      const passwordHash = password ? await bcrypt.hash(String(password).trim(), 10) : undefined;

      // 2. Persist to MongoDB Database
      let savedUser: any = null;
      try {
        savedUser = await UserModel.create({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash: passwordHash || "mock_hash",
          role: targetRole,
        });
        console.log(`✅ [MongoDB] New ${targetRole} registered in database: ${savedUser.name} (${savedUser.phone})`);

        // If registered role is CUSTOMER, also save/sync to Customers collection
        if (targetRole === "CUSTOMER") {
          try {
            await CustomerModel.findOneAndUpdate(
              { phone: cleanPhone },
              {
                name: cleanName,
                phone: cleanPhone,
                email: cleanEmail,
                passwordHash: passwordHash || "mock_hash",
                role: "CUSTOMER",
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`✅ [MongoDB Customers] Customer profile stored for: ${cleanPhone}`);
          } catch (custErr: any) {
            console.warn("[MongoDB Customers] Profile sync warning:", custErr?.message || custErr);
          }
        }
      } catch (dbSaveErr: any) {
        console.error("⚠️ [MongoDB] User creation error:", dbSaveErr.message);
        if (dbSaveErr.code === 11000) {
          res.status(409).json({
            success: false,
            message: "A user with this phone number is already registered in the database.",
          });
          return;
        }
      }

      const userId = savedUser?._id?.toString() || `usr-${Date.now()}`;

      // 3. Keep in-memory store in sync
      const newStoredUser: StoredUser = {
        id: userId,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash: passwordHash || "mock_hash",
        role: targetRole,
        createdAt: new Date().toISOString(),
      };
      dbStore.users.push(newStoredUser);

      const token = jwt.sign(
        {
          id: userId,
          phone: cleanPhone,
          role: targetRole,
          email: cleanEmail,
        },
        ENV.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          role: targetRole,
          createdAt: savedUser?.createdAt || newStoredUser.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Auth Register Error:", error);
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  },

  // Get current logged-in user
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      let userRecord: any = null;
      try {
        userRecord = await UserModel.findById(req.user.id);
      } catch (dbErr) {
        console.warn("[MongoDB] GetCurrentUser DB error:", dbErr);
      }

      if (!userRecord) {
        userRecord = dbStore.users.find((u) => u.id === req.user?.id);
      }

      if (!userRecord) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.json({
        success: true,
        user: {
          id: userRecord._id ? userRecord._id.toString() : userRecord.id,
          name: userRecord.name,
          phone: userRecord.phone,
          email: userRecord.email,
          role: userRecord.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Admin: Get all customers & shoppers for Admin Dashboard
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      let dbUsers: any[] = [];
      try {
        dbUsers = await UserModel.find({ role: "CUSTOMER" }).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn("[MongoDB] getAllCustomers fetch error, using memory store:", dbErr);
      }

      // Merge memory users with DB users, avoiding duplicates
      const seenPhones = new Set<string>();
      const combinedCustomers: any[] = [];

      // Add DB customers first
      dbUsers.forEach((u) => {
        seenPhones.add(u.phone);
        combinedCustomers.push({
          id: u._id.toString(),
          name: u.name,
          phoneNumber: u.phone,
          email: u.email || "N/A",
          role: u.role,
          totalOrders: 0,
          totalSpentBDT: 0,
          isBlocked: false,
          registeredDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        });
      });

      // Add memory customers if not already present
      dbStore.users
        .filter((u) => u.role === "CUSTOMER")
        .forEach((u) => {
          if (!seenPhones.has(u.phone)) {
            seenPhones.add(u.phone);
            combinedCustomers.push({
              id: u.id,
              name: u.name,
              phoneNumber: u.phone,
              email: u.email || "N/A",
              role: u.role,
              totalOrders: 0,
              totalSpentBDT: 0,
              isBlocked: false,
              registeredDate: u.createdAt ? u.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            });
          }
        });

      res.json({
        success: true,
        count: combinedCustomers.length,
        customers: combinedCustomers,
      });
    } catch (error: any) {
      console.error("Get All Customers Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Admin: Get all users (Customers, Admins, Managers)
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      let dbUsers: any[] = [];
      try {
        dbUsers = await UserModel.find({}).sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn("[MongoDB] getAllUsers DB error:", dbErr);
      }

      const seenPhones = new Set<string>();
      const combinedUsers: any[] = [];

      dbUsers.forEach((u) => {
        seenPhones.add(u.phone);
        combinedUsers.push({
          id: u._id.toString(),
          name: u.name,
          phoneNumber: u.phone,
          email: u.email || "N/A",
          role: u.role,
          registeredDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        });
      });

      dbStore.users.forEach((u) => {
        if (!seenPhones.has(u.phone)) {
          seenPhones.add(u.phone);
          combinedUsers.push({
            id: u.id,
            name: u.name,
            phoneNumber: u.phone,
            email: u.email || "N/A",
            role: u.role,
            registeredDate: u.createdAt ? u.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          });
        }
      });

      res.json({
        success: true,
        count: combinedUsers.length,
        users: combinedUsers,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete a user from database
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
      }

      try {
        await UserModel.findByIdAndDelete(id);
      } catch (dbErr) {
        console.warn("[MongoDB] Delete user DB error:", dbErr);
      }

      dbStore.users = dbStore.users.filter((u) => u.id !== id);

      res.json({
        success: true,
        message: "User removed successfully from database",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
