import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Admin only overview
router.get("/overview", authenticate, requireRole(["ADMIN", "MANAGER"]), analyticsController.getOverview);

export default router;
