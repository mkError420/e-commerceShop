import { Router } from "express";
import { paymentController } from "../controllers/paymentController";

const router = Router();

// bKash PGW
router.post("/bkash/create", paymentController.initBkash);
router.post("/bkash/execute", paymentController.executeBkash);

// Nagad PGW
router.post("/nagad/init", paymentController.initNagad);

// SSLCommerz
router.post("/sslcommerz/init", paymentController.initSslcommerz);

// Cash On Delivery
router.post("/cod/confirm", paymentController.confirmCod);

export default router;
