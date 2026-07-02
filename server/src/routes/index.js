import { Router } from "express";
import authRoutes from "./auth.routes.js";
import specialtyRoutes from "./specialty.routes.js";
import doctorRoutes from "./doctor.routes.js";
import patientRoutes from "./patient.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import reportRoutes from "./report.routes.js";
import adminRoutes from "./admin.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patient", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/reports", reportRoutes);
router.use("/admin", adminRoutes);
router.use("/reviews", reviewRoutes);

export default router;