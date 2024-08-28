import { Router } from "express";
import {
  validatePayment,
  createPaymentOrder,
} from "../controllers/payment.controller.js";

const router = Router();

router.route("/validatePayment").post(validatePayment);
router.route("/createPaymentOrder").post(createPaymentOrder);

export default router;
