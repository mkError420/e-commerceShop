import { Router } from "express";
import { locationController } from "../controllers/locationController";

const router = Router();

router.get("/divisions", locationController.getDivisions);
router.get("/districts", locationController.getDistricts);
router.get("/calculate-shipping", locationController.calculateShipping);

export default router;
