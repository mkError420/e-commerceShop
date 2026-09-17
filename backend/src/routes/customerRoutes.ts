import { Router } from "express";
import { customerController } from "../controllers/customerController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// ── Stats (Admin) ────────────────────────────────────────────────────────────
router.get("/stats", customerController.getStats);

// ── My Profile (Authenticated Customer) ───────────────────────────────────────
router.get("/me", authenticate, customerController.getMyProfile);
router.patch("/me", authenticate, customerController.updateMyProfile);

// ── My Addresses (Authenticated Customer) ─────────────────────────────────────
router.post("/me/addresses", authenticate, customerController.addAddress);
router.put("/me/addresses/:addrId", authenticate, customerController.updateAddress);
router.delete("/me/addresses/:addrId", authenticate, customerController.deleteAddress);

// ── Wishlist (Authenticated Customer) ─────────────────────────────────────────
router.post("/me/wishlist/:productId", authenticate, customerController.toggleWishlist);

// ── Admin Customer Management ────────────────────────────────────────────────
router.get("/", customerController.listAll);
router.get("/:id", customerController.getById);
router.patch("/:id/block", customerController.setBlockStatus);
router.patch("/:id/loyalty", customerController.updateLoyalty);
router.delete("/:id", customerController.deleteCustomer);

export default router;
