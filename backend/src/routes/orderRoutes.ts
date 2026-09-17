import { Router } from "express";
import { orderController } from "../controllers/orderController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = Router();

// Public / Customer order tracking & placement
router.get("/track", orderController.trackOrder);
router.post("/", orderController.create);
router.get("/:id", orderController.getById);

// Flexible authentication for orders listing: supports authenticated Admin/Customer as well as public store sync
router.get(
  "/",
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authenticate(req as any, res, next);
    }
    next();
  },
  orderController.getAll
);
router.patch("/:id/status", orderController.updateStatus);
router.put("/:id", orderController.update);
router.delete("/:id", orderController.delete);

export default router;
