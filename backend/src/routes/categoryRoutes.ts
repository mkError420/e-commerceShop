import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/", categoryController.getAll);
router.get("/:slug", categoryController.getBySlug);

// Admin Category Routes
router.post("/", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.create);
router.put("/:id", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.update);
router.delete("/:id", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.delete);

// Admin Subcategory Routes
router.post("/:categoryId/subcategories", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.createSubcategory);
router.put("/:categoryId/subcategories/:subId", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.updateSubcategory);
router.delete("/:categoryId/subcategories/:subId", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.deleteSubcategory);

export default router;
