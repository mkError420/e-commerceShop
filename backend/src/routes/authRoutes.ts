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

export default router;
