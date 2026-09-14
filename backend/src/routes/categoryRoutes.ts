import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Public
router.get("/", categoryController.getAll);
router.get("/:slug", categoryController.getBySlug);

// Admin
router.post("/", authenticate, requireRole(["ADMIN", "MANAGER"]), categoryController.create);

export default router;
