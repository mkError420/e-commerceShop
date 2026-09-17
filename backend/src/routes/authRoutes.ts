import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Public auth endpoints
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authenticate, authController.getCurrentUser);

// Admin customer & user management
router.get("/customers", authController.getAllCustomers);
router.get("/users", authController.getAllUsers);
router.put("/users/:id", authController.updateUser);
router.delete("/users/:id", authController.deleteUser);

// Shop Admin & Staff management
router.get("/admins", authController.getShopAdmins);
router.post("/admins", authController.createShopAdmin);
router.put("/admins/:id", authController.updateShopAdmin);
router.delete("/admins/:id", authController.deleteShopAdmin);
router.patch("/admins/:id/toggle-status", authController.toggleShopAdminStatus);

export default router;
