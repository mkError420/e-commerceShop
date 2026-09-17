import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import categoryRoutes from "./categoryRoutes";
import orderRoutes from "./orderRoutes";
import paymentRoutes from "./paymentRoutes";
import couponRoutes from "./couponRoutes";
import locationRoutes from "./locationRoutes";
import analyticsRoutes from "./analyticsRoutes";
import uploadRoutes from "./uploadRoutes";
import customerRoutes from "./customerRoutes";
import bannerRoutes from "./bannerRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/coupons", couponRoutes);
router.use("/locations", locationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/upload", uploadRoutes);
router.use("/customers", customerRoutes);
router.use("/banners", bannerRoutes);

export default router;
