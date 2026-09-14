import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Public / Customer order tracking & placement
router.get("/track", orderController.trackOrder);
router.post("/", orderController.create);
router.get("/:id", orderController.getById);

// Admin order management
router.get("/", authenticate, requireRole(["ADMIN", "MANAGER"]), orderController.getAll);
router.patch("/:id/status", authenticate, requireRole(["ADMIN", "MANAGER"]), orderController.updateStatus);

export default router;
