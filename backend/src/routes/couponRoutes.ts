import { Router } from "express";
import { couponController } from "../controllers/couponController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Public validation
router.post("/validate", couponController.validate);

// Admin management
router.get("/", authenticate, requireRole(["ADMIN"]), couponController.getAll);
router.post("/", authenticate, requireRole(["ADMIN"]), couponController.create);

export default router;
