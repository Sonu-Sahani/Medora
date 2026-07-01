import { Router } from "express";
import {
  getAvailableSlots,
  createOrder,
  verifyPaymentAndBook,
  getMyAppointments,
  cancelAppointment,
} from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

router.get("/slots", getAvailableSlots);
router.get("/my", restrictTo("patient"), getMyAppointments);
router.post("/create-order", restrictTo("patient"), createOrder);
router.post("/verify-payment", restrictTo("patient"), verifyPaymentAndBook);
router.patch("/:id/cancel", restrictTo("patient"), cancelAppointment);

export default router;