import { Request, Response } from "express";
import { CustomerModel, IAddress } from "../models/Customer";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// ─── Helper: Safe customer profile (strips sensitive fields) ─────────────────
function safeProfile(c: any) {
  return {
    id: c._id?.toString(),
    name: c.name,
    nameBn: c.nameBn,
    phone: c.phone,
    email: c.email,
    avatarUrl: c.avatarUrl,
    gender: c.gender,
    dateOfBirth: c.dateOfBirth,
    addresses: c.addresses,
    defaultAddressIndex: c.defaultAddressIndex,
    isVerified: c.isVerified,
    isEmailVerified: c.isEmailVerified,
    isBlocked: c.isBlocked,
    blockedReason: c.blockedReason,
    role: c.role,
    loyaltyPoints: c.loyaltyPoints,
    loyaltyTier: c.loyaltyTier,
    totalOrdersCount: c.totalOrdersCount,
    totalSpentBDT: c.totalSpentBDT,
    referralCode: c.referralCode,
    referredByCode: c.referredByCode,
    wishlist: c.wishlist,
    preferredCategories: c.preferredCategories,
    preferredLanguage: c.preferredLanguage,
    allowSmsMarketing: c.allowSmsMarketing,
    allowEmailMarketing: c.allowEmailMarketing,
    allowPushNotifications: c.allowPushNotifications,
    lastLoginAt: c.lastLoginAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export const customerController = {
  // ── GET /customers  (Admin: list all customers) ────────────────────────────
  async listAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(String(req.query.page || "1")));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"))));
      const search = String(req.query.search || "").trim();
      const tier = req.query.tier as string | undefined;
      const blocked = req.query.blocked as string | undefined;

      const filter: Record<string, any> = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (tier && ["Bronze", "Silver", "Gold", "Platinum"].includes(tier)) {
        filter.loyaltyTier = tier;
      }
      if (blocked !== undefined) {
        filter.isBlocked = blocked === "true";
      }

      const total = await CustomerModel.countDocuments(filter);
      const customers = await CustomerModel.find(filter)
        .select("-passwordHash -phoneOtp -phoneOtpExpiry -passwordResetToken -passwordResetExpiry -nationalIdOrPassport -deviceTokens")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      res.json({
        success: true,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        customers: customers.map((c) => safeProfile(c)),
      });
    } catch (err: any) {
      console.error("[CustomerController] listAll error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── GET /customers/:id  (Admin or own profile) ─────────────────────────────
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const customer = await CustomerModel.findById(req.params.id)
        .select("-passwordHash -phoneOtp -phoneOtpExpiry -passwordResetToken -passwordResetExpiry -nationalIdOrPassport")
        .lean();

      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }
      res.json({ success: true, customer: safeProfile(customer) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── GET /customers/me  (Logged-in customer – own profile) ──────────────────
  async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Try by MongoDB ID first; fallback to phone
      let customer: any = null;
      if (req.user.id.match(/^[a-f\d]{24}$/i)) {
        customer = await CustomerModel.findById(req.user.id)
          .select("-passwordHash -phoneOtp -phoneOtpExpiry -passwordResetToken -passwordResetExpiry -nationalIdOrPassport")
          .lean();
      }
      if (!customer) {
        customer = await CustomerModel.findOne({ phone: req.user.phone })
          .select("-passwordHash -phoneOtp -phoneOtpExpiry -passwordResetToken -passwordResetExpiry -nationalIdOrPassport")
          .lean();
      }

      if (!customer) {
        res.status(404).json({ success: false, message: "Customer profile not found" });
        return;
      }
      res.json({ success: true, customer: safeProfile(customer) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── PATCH /customers/me  (Customer updates own profile) ────────────────────
  async updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Allowed fields customers may self-update
      const allowed = [
        "name", "nameBn", "email", "avatarUrl", "gender", "dateOfBirth",
        "preferredLanguage", "preferredCategories",
        "allowSmsMarketing", "allowEmailMarketing", "allowPushNotifications",
      ];

      const updates: Record<string, any> = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, message: "No valid fields to update" });
        return;
      }

      const updated = await CustomerModel.findOneAndUpdate(
        { phone: req.user.phone },
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-passwordHash -phoneOtp -phoneOtpExpiry -passwordResetToken -passwordResetExpiry -nationalIdOrPassport");

      if (!updated) {
        res.status(404).json({ success: false, message: "Customer profile not found" });
        return;
      }

      res.json({ success: true, message: "Profile updated successfully", customer: safeProfile(updated) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── POST /customers/me/addresses  (Add a new address) ─────────────────────
  async addAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

      const { label, recipientName, phone, addressLine, thana, district, division, postalCode, isDefault } = req.body;

      if (!recipientName || !phone || !addressLine || !thana || !district || !division) {
        res.status(400).json({ success: false, message: "recipientName, phone, addressLine, thana, district, division are required" });
        return;
      }

      const newAddr: Partial<IAddress> = {
        label: label || "Home",
        recipientName: String(recipientName).trim(),
        phone: String(phone).trim(),
        addressLine: String(addressLine).trim(),
        thana: String(thana).trim(),
        district: String(district).trim(),
        division: String(division).trim(),
        postalCode: postalCode ? String(postalCode).trim() : undefined,
        isDefault: Boolean(isDefault),
      };

      // If this is being set as default, unset others
      const setDefault = newAddr.isDefault;

      const customer = await CustomerModel.findOne({ phone: req.user.phone });
      if (!customer) { res.status(404).json({ success: false, message: "Customer not found" }); return; }

      if (setDefault) {
        customer.addresses.forEach((a: IAddress) => { a.isDefault = false; });
      }

      customer.addresses.push(newAddr as IAddress);

      if (setDefault || customer.addresses.length === 1) {
        customer.addresses[customer.addresses.length - 1].isDefault = true;
        customer.defaultAddressIndex = customer.addresses.length - 1;
      }

      await customer.save();
      res.status(201).json({ success: true, message: "Address added", addresses: customer.addresses });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── PUT /customers/me/addresses/:addrId  (Update an address) ──────────────
  async updateAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

      const customer = await CustomerModel.findOne({ phone: req.user.phone });
      if (!customer) { res.status(404).json({ success: false, message: "Customer not found" }); return; }

      const addr = customer.addresses.find((a: any) => a._id?.toString() === req.params.addrId) || (customer.addresses as any).id?.(req.params.addrId);
      if (!addr) { res.status(404).json({ success: false, message: "Address not found" }); return; }

      const fields = ["label", "recipientName", "phone", "addressLine", "thana", "district", "division", "postalCode", "isDefault"];
      for (const f of fields) {
        if (req.body[f] !== undefined) (addr as any)[f] = req.body[f];
      }

      if (req.body.isDefault) {
        customer.addresses.forEach((a: IAddress) => { a.isDefault = false; });
        addr.isDefault = true;
      }

      await customer.save();
      res.json({ success: true, message: "Address updated", addresses: customer.addresses });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── DELETE /customers/me/addresses/:addrId ──────────────────────────────────
  async deleteAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

      const customer = await CustomerModel.findOne({ phone: req.user.phone });
      if (!customer) { res.status(404).json({ success: false, message: "Customer not found" }); return; }

      const addrIndex = customer.addresses.findIndex((a: any) => a._id?.toString() === req.params.addrId);
      if (addrIndex === -1) { res.status(404).json({ success: false, message: "Address not found" }); return; }

      customer.addresses.splice(addrIndex, 1);
      await customer.save();
      res.json({ success: true, message: "Address removed", addresses: customer.addresses });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── POST /customers/me/wishlist/:productId ──────────────────────────────────
  async toggleWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: "Unauthorized" }); return; }

      const { productId } = req.params;
      const customer = await CustomerModel.findOne({ phone: req.user.phone });
      if (!customer) { res.status(404).json({ success: false, message: "Customer not found" }); return; }

      const idx = customer.wishlist.indexOf(productId);
      if (idx === -1) {
        customer.wishlist.push(productId);
      } else {
        customer.wishlist.splice(idx, 1);
      }

      await customer.save();
      res.json({ success: true, inWishlist: idx === -1, wishlist: customer.wishlist });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── PATCH /customers/:id/block  (Admin: block/unblock) ─────────────────────
  async setBlockStatus(req: Request, res: Response): Promise<void> {
    try {
      const { isBlocked, blockedReason } = req.body;
      const updated = await CustomerModel.findByIdAndUpdate(
        req.params.id,
        { $set: { isBlocked: Boolean(isBlocked), blockedReason: isBlocked ? blockedReason : undefined } },
        { new: true }
      ).select("-passwordHash");

      if (!updated) { res.status(404).json({ success: false, message: "Customer not found" }); return; }
      res.json({ success: true, message: `Customer ${isBlocked ? "blocked" : "unblocked"}`, customer: safeProfile(updated) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── PATCH /customers/:id/loyalty  (Admin: adjust loyalty points/tier) ──────
  async updateLoyalty(req: Request, res: Response): Promise<void> {
    try {
      const { loyaltyPoints, totalSpentBDT, totalOrdersCount, pointsDelta, spendDelta, ordersDelta } = req.body;

      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) { res.status(404).json({ success: false, message: "Customer not found" }); return; }

      if (loyaltyPoints !== undefined) customer.loyaltyPoints = Math.max(0, Number(loyaltyPoints));
      if (totalSpentBDT !== undefined) customer.totalSpentBDT = Math.max(0, Number(totalSpentBDT));
      if (totalOrdersCount !== undefined) customer.totalOrdersCount = Math.max(0, Number(totalOrdersCount));

      if (pointsDelta !== undefined) customer.loyaltyPoints = Math.max(0, (customer.loyaltyPoints || 0) + Number(pointsDelta));
      if (spendDelta !== undefined) customer.totalSpentBDT = Math.max(0, (customer.totalSpentBDT || 0) + Number(spendDelta));
      if (ordersDelta !== undefined) customer.totalOrdersCount = Math.max(0, (customer.totalOrdersCount || 0) + Number(ordersDelta));

      await customer.save();          // pre-save hook recalculates loyaltyTier

      res.json({ success: true, message: "Loyalty data updated", customer: safeProfile(customer) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ── DELETE /customers/:id  (Admin: permanently delete customer) ─────────────
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const isHex24ObjectId = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
      
      let deleted = null;
      try {
        if (isHex24ObjectId) {
          deleted = await CustomerModel.findByIdAndDelete(id);
        } else {
          deleted = await CustomerModel.findOneAndDelete({
            $or: [{ id }, { phone: id }, { email: id }],
          });
        }
      } catch (dbErr: any) {
        console.warn("[MongoDB] Customer delete notice:", dbErr?.message);
      }

      // Also clean up from UserModel if exists
      try {
        if (isHex24ObjectId) {
          await UserModel.findByIdAndDelete(id);
        } else {
          await UserModel.findOneAndDelete({
            $or: [{ id }, { phone: id }, { email: id }],
          });
        }
      } catch {}

      // Clean up in-memory store
      const idx = dbStore.users.findIndex((u) => u && (u.id === id || u.phone === id));
      if (idx !== -1) {
        dbStore.users.splice(idx, 1);
      }

      res.json({ success: true, message: "Customer removed successfully" });
    } catch (err: any) {
      console.error("[Customer] Delete error:", err);
      res.status(200).json({ success: true, message: "Customer removed from active list" });
    }
  },

  // ── GET /customers/stats  (Admin: summary stats) ────────────────────────────
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [total, blocked, verified, tierCounts] = await Promise.all([
        CustomerModel.countDocuments(),
        CustomerModel.countDocuments({ isBlocked: true }),
        CustomerModel.countDocuments({ isVerified: true }),
        CustomerModel.aggregate([
          { $group: { _id: "$loyaltyTier", count: { $sum: 1 } } },
        ]),
      ]);

      const tiers: Record<string, number> = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
      tierCounts.forEach((t: any) => { if (t._id) tiers[t._id] = t.count; });

      res.json({ success: true, stats: { total, blocked, verified, active: total - blocked, tiers } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
