import { Router } from "express";
import { productController } from "../controllers/productController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/", productController.getAll);
router.get("/:slugOrId", productController.getBySlugOrId);

// Admin / Manager protected routes
router.post("/", authenticate, requireRole(["ADMIN", "MANAGER"]), productController.create);
router.patch("/:slugOrId", authenticate, requireRole(["ADMIN", "MANAGER"]), productController.update);
router.delete("/:slugOrId", authenticate, requireRole(["ADMIN"]), productController.delete);

export default router;
