import { Router } from "express";
import { bannerController } from "../controllers/bannerController";

const router = Router();

// Public banner endpoints
router.get("/", bannerController.getAll);
router.get("/:id", bannerController.getById);

// Admin management endpoints
router.post("/", bannerController.create);
router.put("/:id", bannerController.update);
router.delete("/:id", bannerController.delete);
router.patch("/:id/toggle", bannerController.toggleStatus);

export default router;
