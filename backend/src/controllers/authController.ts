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

  // Google OAuth Sign In / Sign Up
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, picture, googleId, credential } = req.body;

      let cleanEmail = email ? String(email).trim().toLowerCase() : "";
      let cleanName = name ? String(name).trim() : "";
      let avatarPicture = picture;
      let gid = googleId;

      // If raw Google ID token (credential) was passed, decode payload
      if (credential) {
        try {
          const parts = String(credential).split(".");
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
            if (decoded.email) cleanEmail = decoded.email.toLowerCase().trim();
            if (decoded.name) cleanName = cleanName || decoded.name.trim();
            if (decoded.picture) avatarPicture = avatarPicture || decoded.picture;
            if (decoded.sub) gid = gid || decoded.sub;
          }
        } catch (e) {
          console.warn("[Google Auth] Error decoding credential:", e);
        }
      }

      if (!cleanEmail) {
        res.status(400).json({ success: false, message: "Google email is required" });
        return;
      }

      cleanName = cleanName || cleanEmail.split("@")[0];

      // 1. Check if user already exists in MongoDB
      let dbUser: any = null;
      try {
        dbUser = await UserModel.findOne({
          email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
        });
      } catch (dbErr) {
        console.warn("[MongoDB Google Auth] Lookup failed:", dbErr);
      }

      // Check if user exists in memory store
      let memUser = dbStore.users.find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );

      // Determine role: Shop Admin email is ADMIN
      const isAdminEmail =
        cleanEmail === "mk.rabbani.cse@gmail.com" ||
        cleanEmail === "admin@shorobor.com.bd";
      const targetRole = isAdminEmail ? "ADMIN" : "CUSTOMER";

      let userRecord: any = null;
      const randomPhone = `017${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`;

      if (dbUser) {
        userRecord = {
          id: dbUser._id.toString(),
          name: dbUser.name || cleanName,
          phone: dbUser.phone || randomPhone,
          email: dbUser.email,
          role: dbUser.role || targetRole,
          picture: avatarPicture,
        };
      } else if (memUser) {
        userRecord = {
          id: memUser.id,
          name: memUser.name || cleanName,
          phone: memUser.phone || randomPhone,
          email: memUser.email,
          role: memUser.role || targetRole,
          picture: avatarPicture,
        };
      } else {
        // Create new user in DB
        try {
          dbUser = await UserModel.create({
            name: cleanName,
            email: cleanEmail,
            phone: randomPhone,
            passwordHash: "google_oauth_verified",
            role: targetRole,
          });
          userRecord = {
            id: dbUser._id.toString(),
            name: dbUser.name,
            phone: dbUser.phone,
            email: dbUser.email,
            role: dbUser.role,
            picture: avatarPicture,
          };
          console.log("✅ [MongoDB] New Google User Account registered:", cleanEmail);
        } catch (createErr) {
          console.warn("[MongoDB Google Auth] User creation fallback to memory store:", createErr);
        }

        if (!userRecord) {
          const newMemUser: StoredUser = {
            id: `usr-${Date.now()}`,
            name: cleanName,
            phone: randomPhone,
            email: cleanEmail,
            passwordHash: "google_oauth_verified",
            role: targetRole,
            createdAt: new Date().toISOString(),
          };
          dbStore.users.push(newMemUser);
          userRecord = {
            id: newMemUser.id,
            name: newMemUser.name,
            phone: newMemUser.phone,
            email: newMemUser.email,
            role: newMemUser.role,
            picture: avatarPicture,
          };
        }
      }

      // Also ensure Customer profile exists in MongoDB
      if (targetRole === "CUSTOMER") {
        try {
          let customerDoc = await CustomerModel.findOne({ email: cleanEmail });
          if (!customerDoc) {
            customerDoc = await CustomerModel.create({
              name: cleanName,
              email: cleanEmail,
              phone: userRecord.phone || randomPhone,
              passwordHash: "google_oauth_verified",
              avatarUrl: avatarPicture,
              isEmailVerified: true,
              isVerified: true,
              loyaltyPoints: 100,
              loyaltyTier: "Bronze",
            });
            console.log("✅ [MongoDB] New Customer profile created for Google user:", cleanEmail);
          }
        } catch (custErr) {
          console.warn("[MongoDB] Customer profile check/create warning:", custErr);
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
          picture: avatarPicture,
        },
        message: `Welcome, ${userRecord.name}! Google sign-in successful.`,
      });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      res.status(500).json({ success: false, message: error.message || "Internal server error" });
    }
  },

  // Register a new customer or admin directly into MongoDB database
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, email, password, role, permissions } = req.body;
      if (!name || (!phone && !email)) {
        res.status(400).json({ success: false, message: "Name and Phone number or Email are required" });
        return;
      }

      const cleanPhone = phone ? String(phone).trim() : `017${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`;
      const cleanName = String(name).trim();
      const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;
      const targetRole: "ADMIN" | "CUSTOMER" | "MANAGER" =
        role === "ADMIN" ? "ADMIN" : role === "MANAGER" ? "MANAGER" : "CUSTOMER";

      const defaultPermissions = targetRole === "ADMIN"
        ? ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]
        : targetRole === "MANAGER"
        ? ["dashboard", "products", "categories", "orders", "customers", "coupons"]
        : [];
      const finalPermissions = Array.isArray(permissions) && permissions.length > 0 ? permissions : defaultPermissions;

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
        (u) => (phone && u.phone === cleanPhone) || (cleanEmail && u.email?.toLowerCase() === cleanEmail)
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
          permissions: finalPermissions,
        });
        console.log(`✅ [MongoDB] New ${targetRole} registered in database: ${savedUser.name} (${savedUser.phone})`);

        // Also save/sync to Customers collection for unified CRM profile
        try {
          await CustomerModel.findOneAndUpdate(
            { phone: cleanPhone },
            {
              name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              passwordHash: passwordHash || "mock_hash",
              role: targetRole,
              isVerified: true,
              loyaltyPoints: 100,
              loyaltyTier: "Bronze",
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          console.log(`✅ [MongoDB Customers] Customer profile stored for: ${cleanPhone}`);
        } catch (custErr: any) {
          console.warn("[MongoDB Customers] Profile sync warning:", custErr?.message || custErr);
        }
      } catch (dbSaveErr: any) {
        console.error("⚠️ [MongoDB] User creation error:", dbSaveErr.message);
        if (dbSaveErr.code === 11000) {
          res.status(409).json({
            success: false,
            message: "A user with this phone number or email is already registered in the database.",
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
        permissions: finalPermissions,
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
      let dbCustomers: any[] = [];
      try {
        dbCustomers = await CustomerModel.find({}).sort({ createdAt: -1 }).lean();
      } catch (custErr) {
        console.warn("[MongoDB] getAllCustomers CustomerModel fetch error:", custErr);
      }
      try {
        dbUsers = await UserModel.find({}).sort({ createdAt: -1 }).lean();
      } catch (dbErr) {
        console.warn("[MongoDB] getAllCustomers UserModel fetch error:", dbErr);
      }

      // Merge CustomerModel, UserModel, and in-memory customers by phone or email
      const customerMap = new Map<string, any>();

      // 1. Add from CustomerModel (rich profiles with orders, spent, status)
      dbCustomers.forEach((c: any) => {
        const key = c.phone || c.email || (c._id ? c._id.toString() : `cust-${Date.now()}`);
        customerMap.set(key, {
          id: c._id ? c._id.toString() : `cust-${Date.now()}`,
          name: c.name || "Customer",
          phoneNumber: c.phone || "N/A",
          email: c.email || "N/A",
          role: c.role || "CUSTOMER",
          totalOrders: c.totalOrdersCount || 0,
          totalSpentBDT: c.totalSpentBDT || 0,
          isBlocked: !!c.isBlocked,
          loyaltyTier: c.loyaltyTier || "Bronze",
          loyaltyPoints: c.loyaltyPoints || 0,
          permissions: [],
          registeredDate: c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        });
      });

      // 2. Add or enrich with UserModel records (which have actual roles & permissions)
      dbUsers.forEach((u: any) => {
        const key = u.phone || u.email || (u._id ? u._id.toString() : `usr-${Date.now()}`);
        const existing = customerMap.get(key) || customerMap.get(u.phone) || (u.email ? customerMap.get(u.email) : null);
        if (existing) {
          existing.id = u._id ? u._id.toString() : existing.id;
          existing.role = u.role || existing.role || "CUSTOMER";
          existing.permissions = u.permissions || existing.permissions || [];
          if (u.name && !existing.name) existing.name = u.name;
          if (u.email && (!existing.email || existing.email === "N/A")) existing.email = u.email;
          if (u.isBlocked !== undefined) existing.isBlocked = !!u.isBlocked;
        } else {
          customerMap.set(key, {
            id: u._id ? u._id.toString() : `usr-${Date.now()}`,
            name: u.name || "User",
            phoneNumber: u.phone || "N/A",
            email: u.email || "N/A",
            role: u.role || "CUSTOMER",
            totalOrders: 0,
            totalSpentBDT: 0,
            isBlocked: !!u.isBlocked,
            loyaltyTier: "Bronze",
            loyaltyPoints: 100,
            permissions: u.permissions || (u.role === "ADMIN" ? ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"] : []),
            registeredDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          });
        }
      });

      // 3. Add memory users if not already present
      dbStore.users.forEach((u) => {
        const key = u.phone || u.email || u.id;
        const existing = customerMap.get(key) || customerMap.get(u.phone) || (u.email ? customerMap.get(u.email) : null);
        if (existing) {
          existing.role = u.role || existing.role;
          if (u.permissions) existing.permissions = u.permissions;
        } else {
          customerMap.set(key, {
            id: u.id,
            name: u.name,
            phoneNumber: u.phone || "N/A",
            email: u.email || "N/A",
            role: u.role,
            totalOrders: 0,
            totalSpentBDT: 0,
            isBlocked: !!u.isBlocked,
            loyaltyTier: "Bronze",
            loyaltyPoints: 100,
            permissions: u.permissions || (u.role === "ADMIN" ? ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"] : []),
            registeredDate: u.createdAt ? u.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          });
        }
      });

      const combinedCustomers = Array.from(customerMap.values());

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

  // Delete a customer or user from database
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
      }

      let phone: string | undefined;

      // 1. Check UserModel
      try {
        const u = await UserModel.findById(id);
        if (u) {
          phone = u.phone;
          await UserModel.findByIdAndDelete(id);
        }
      } catch (dbErr) {
        console.warn("[MongoDB] Delete user from UserModel error:", dbErr);
      }

      // 2. Check CustomerModel
      try {
        const c = await CustomerModel.findById(id);
        if (c) {
          phone = phone || c.phone;
          await CustomerModel.findByIdAndDelete(id);
        }
      } catch (custErr) {
        console.warn("[MongoDB] Delete user from CustomerModel error:", custErr);
      }

      // 3. If phone is identified or id is a phone number, delete matches in both collections
      const cleanId = id.trim();
      const targetPhone = phone || (cleanId.startsWith("01") && cleanId.length === 11 ? cleanId : undefined);

      if (targetPhone) {
        try { await UserModel.deleteMany({ phone: targetPhone }); } catch {}
        try { await CustomerModel.deleteMany({ phone: targetPhone }); } catch {}
        dbStore.users = dbStore.users.filter((u) => u.phone !== targetPhone && u.id !== id);
      } else {
        dbStore.users = dbStore.users.filter((u) => u.id !== id);
      }

      res.json({
        success: true,
        message: "Customer account removed successfully from database",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update a customer or user in database (Profile, Role, Permissions, Password, Status)
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, email, role, isBlocked, permissions, password } = req.body;
      if (!id) {
        res.status(400).json({ success: false, message: "User ID is required" });
        return;
      }

      let existingPhone: string | undefined;
      let existingUserDoc: any = null;
      let existingCustDoc: any = null;

      // Look up existing user to get phone & existing record
      try {
        existingUserDoc = await UserModel.findById(id);
        if (existingUserDoc) existingPhone = existingUserDoc.phone;
      } catch {}
      if (!existingPhone) {
        try {
          existingCustDoc = await CustomerModel.findById(id);
          if (existingCustDoc) existingPhone = existingCustDoc.phone;
        } catch {}
      }

      const updateData: Record<string, any> = {};
      if (name) updateData.name = String(name).trim();
      if (phone) updateData.phone = String(phone).trim();
      if (email !== undefined) updateData.email = email ? String(email).trim().toLowerCase() : undefined;
      if (role) updateData.role = role;
      if (isBlocked !== undefined) updateData.isBlocked = Boolean(isBlocked);

      // Handle password update / reset
      if (password && String(password).trim().length >= 6) {
        const hash = await bcrypt.hash(String(password).trim(), 10);
        updateData.passwordHash = hash;
      }

      // Handle permissions if role is ADMIN or MANAGER
      if (Array.isArray(permissions) && permissions.length > 0) {
        updateData.permissions = permissions;
      } else if (role === "ADMIN") {
        updateData.permissions = ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"];
      } else if (role === "MANAGER") {
        updateData.permissions = ["dashboard", "products", "categories", "orders", "customers", "coupons"];
      }

      const customerUpdateData = { ...updateData };

      // Update / Upsert in UserModel
      try {
        const targetPhone = updateData.phone || existingPhone;
        if (targetPhone) {
          const updated = await UserModel.findOneAndUpdate(
            { phone: targetPhone },
            { $set: updateData },
            { new: true }
          );
          if (!updated && (role === "ADMIN" || role === "MANAGER" || name)) {
            await UserModel.create({
              name: updateData.name || existingCustDoc?.name || "Staff Member",
              phone: targetPhone,
              email: updateData.email || existingCustDoc?.email || "",
              passwordHash: updateData.passwordHash || "admin123",
              role: role || "ADMIN",
              permissions: updateData.permissions || ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
              isBlocked: !!updateData.isBlocked,
            });
          }
        } else {
          await UserModel.findByIdAndUpdate(id, { $set: updateData });
        }
      } catch (uErr) {
        console.warn("[MongoDB] updateUser UserModel error:", uErr);
      }

      // Update / Upsert in CustomerModel
      try {
        const targetPhone = updateData.phone || existingPhone;
        if (targetPhone) {
          await CustomerModel.updateMany({ phone: targetPhone }, { $set: customerUpdateData });
        } else {
          await CustomerModel.findByIdAndUpdate(id, { $set: customerUpdateData });
        }
      } catch (cErr) {
        console.warn("[MongoDB] updateUser CustomerModel error:", cErr);
      }

      // Update in-memory store
      dbStore.users = dbStore.users.map((u) => {
        if (u.id === id || (existingPhone && u.phone === existingPhone)) {
          return {
            ...u,
            ...updateData,
          };
        }
        return u;
      });

      res.json({
        success: true,
        message: role === "ADMIN" || role === "MANAGER"
          ? `User promoted to Shop ${role === "ADMIN" ? "Admin" : "Manager"} successfully with full function!`
          : "User profile updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // SHOP ADMIN MANAGEMENT (Admins & Managers)
  // ==========================================

  // Get all shop administrators and managers
  async getShopAdmins(req: Request, res: Response): Promise<void> {
    try {
      let dbAdmins: any[] = [];
      try {
        dbAdmins = await UserModel.find({ role: { $in: ["ADMIN", "MANAGER"] } }).sort({ createdAt: -1 }).lean();
      } catch (dbErr) {
        console.warn("[MongoDB] getShopAdmins fetch warning:", dbErr);
      }

      const adminMap = new Map<string, any>();

      // 1. Add from MongoDB
      dbAdmins.forEach((u: any) => {
        const phone = u.phone || u._id.toString();
        adminMap.set(phone, {
          id: u._id.toString(),
          name: u.name,
          phone: u.phone,
          email: u.email || "",
          role: u.role || "ADMIN",
          isBlocked: !!u.isBlocked,
          permissions: u.permissions || ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        });
      });

      // 2. Add from in-memory store
      dbStore.users
        .filter((u) => u.role === "ADMIN" || u.role === "MANAGER")
        .forEach((u) => {
          if (!adminMap.has(u.phone)) {
            adminMap.set(u.phone, {
              id: u.id,
              name: u.name,
              phone: u.phone,
              email: u.email || "",
              role: u.role,
              isBlocked: !!u.isBlocked,
              permissions: u.permissions || ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
              createdAt: u.createdAt || new Date().toISOString(),
            });
          }
        });

      const admins = Array.from(adminMap.values());

      res.json({
        success: true,
        count: admins.length,
        admins,
      });
    } catch (error: any) {
      console.error("Get Shop Admins Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create a new Shop Admin or Manager
  async createShopAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, email, password, role, permissions } = req.body;
      if (!name || !phone) {
        res.status(400).json({ success: false, message: "Admin Name and Bangladeshi Phone number are required." });
        return;
      }

      const cleanPhone = String(phone).trim();
      const cleanName = String(name).trim();
      const cleanEmail = email ? String(email).trim().toLowerCase() : "";
      const targetRole: "ADMIN" | "MANAGER" = role === "MANAGER" ? "MANAGER" : "ADMIN";
      const defaultPermissions = targetRole === "ADMIN"
        ? ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"]
        : ["dashboard", "products", "categories", "orders", "customers", "coupons"];
      const finalPermissions = Array.isArray(permissions) && permissions.length > 0 ? permissions : defaultPermissions;

      // Check if user with this phone or email already exists
      let existingInDb: any = null;
      try {
        existingInDb = await UserModel.findOne({
          $or: [
            { phone: cleanPhone },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        });
      } catch (dbErr) {
        console.warn("[MongoDB] Check admin exists error:", dbErr);
      }

      const existingInMem = dbStore.users.find(
        (u) => u.phone === cleanPhone || (cleanEmail && u.email?.toLowerCase() === cleanEmail)
      );

      if (existingInDb || existingInMem) {
        res.status(409).json({
          success: false,
          message: "An account with this phone number or email already exists.",
        });
        return;
      }

      // Hash password
      const rawPass = password ? String(password).trim() : "admin123";
      const passwordHash = await bcrypt.hash(rawPass, 10);

      // Save to MongoDB
      let savedDbAdmin: any = null;
      try {
        savedDbAdmin = await UserModel.create({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash,
          role: targetRole,
          isBlocked: false,
          permissions: finalPermissions,
        });
        console.log(`✅ [MongoDB] New Shop Admin saved to database: ${cleanName} (${cleanPhone})`);
      } catch (dbSaveErr: any) {
        console.warn("[MongoDB] Shop admin create warning:", dbSaveErr.message);
      }

      const adminId = savedDbAdmin?._id?.toString() || `usr-admin-${Date.now()}`;
      const createdAt = savedDbAdmin?.createdAt ? new Date(savedDbAdmin.createdAt).toISOString() : new Date().toISOString();

      // Save to in-memory store
      const memAdmin: StoredUser = {
        id: adminId,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
        role: targetRole,
        isBlocked: false,
        permissions: finalPermissions,
        createdAt,
      };
      dbStore.users.push(memAdmin);

      res.status(201).json({
        success: true,
        message: `Shop ${targetRole === "ADMIN" ? "Admin" : "Manager"} created successfully!`,
        admin: {
          id: adminId,
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          role: targetRole,
          isBlocked: false,
          permissions: finalPermissions,
          createdAt,
        },
      });
    } catch (error: any) {
      console.error("Create Shop Admin Error:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to create shop admin." });
    }
  },

  // Update existing Shop Admin / Manager
  async updateShopAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, email, password, role, permissions, isBlocked } = req.body;

      if (!id) {
        res.status(400).json({ success: false, message: "Admin ID is required" });
        return;
      }

      const updateData: Record<string, any> = {};
      if (name) updateData.name = String(name).trim();
      if (phone) updateData.phone = String(phone).trim();
      if (email !== undefined) updateData.email = email ? String(email).trim().toLowerCase() : "";
      if (role) updateData.role = role === "MANAGER" ? "MANAGER" : "ADMIN";
      if (Array.isArray(permissions)) updateData.permissions = permissions;
      if (isBlocked !== undefined) updateData.isBlocked = Boolean(isBlocked);

      if (password && String(password).trim().length >= 6) {
        updateData.passwordHash = await bcrypt.hash(String(password).trim(), 10);
      }

      // Update in MongoDB
      try {
        await UserModel.findByIdAndUpdate(id, { $set: updateData });
        if (updateData.phone) {
          await UserModel.updateOne({ phone: updateData.phone }, { $set: updateData });
        }
      } catch (dbErr) {
        console.warn("[MongoDB] Update shop admin error:", dbErr);
      }

      // Update in dbStore
      let foundInMem = false;
      dbStore.users = dbStore.users.map((u) => {
        if (u.id === id || (updateData.phone && u.phone === updateData.phone)) {
          foundInMem = true;
          return {
            ...u,
            ...updateData,
          };
        }
        return u;
      });

      if (!foundInMem && updateData.name) {
        dbStore.users.push({
          id,
          name: updateData.name || "Admin User",
          phone: updateData.phone || "01700000000",
          email: updateData.email || "",
          passwordHash: updateData.passwordHash || "mock_hash",
          role: updateData.role || "ADMIN",
          isBlocked: !!updateData.isBlocked,
          permissions: updateData.permissions || ["dashboard", "products", "categories", "orders", "customers", "coupons", "settings", "admins"],
          createdAt: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        message: "Shop Admin profile updated successfully.",
      });
    } catch (error: any) {
      console.error("Update Shop Admin Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete a Shop Admin / Manager
  async deleteShopAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: "Admin ID is required" });
        return;
      }

      // Safeguard: Check total admins
      const activeAdminsMem = dbStore.users.filter((u) => u.role === "ADMIN");
      let activeAdminsDbCount = 0;
      try {
        activeAdminsDbCount = await UserModel.countDocuments({ role: "ADMIN" });
      } catch {}

      if (activeAdminsDbCount <= 1 && activeAdminsMem.length <= 1) {
        res.status(400).json({
          success: false,
          message: "Cannot delete the only remaining Administrator account in the system.",
        });
        return;
      }

      // Delete from MongoDB
      try {
        await UserModel.findByIdAndDelete(id);
      } catch (dbErr) {
        console.warn("[MongoDB] Delete shop admin error:", dbErr);
      }

      // Delete from dbStore
      dbStore.users = dbStore.users.filter((u) => u.id !== id);

      res.json({
        success: true,
        message: "Shop Admin removed successfully.",
      });
    } catch (error: any) {
      console.error("Delete Shop Admin Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Toggle active / blocked status of Shop Admin
  async toggleShopAdminStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let newBlockedState = false;

      // Check DB first
      try {
        const u = await UserModel.findById(id);
        if (u) {
          u.isBlocked = !u.isBlocked;
          await u.save();
          newBlockedState = !!u.isBlocked;
        }
      } catch (dbErr) {
        console.warn("[MongoDB] Toggle status error:", dbErr);
      }

      // Check / update memory store
      const memUser = dbStore.users.find((u) => u.id === id);
      if (memUser) {
        memUser.isBlocked = !memUser.isBlocked;
        newBlockedState = !!memUser.isBlocked;
      }

      res.json({
        success: true,
        isBlocked: newBlockedState,
        message: newBlockedState ? "Admin account suspended" : "Admin account activated",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

