import { Router } from "express";
import authRoutes from "./auth.routes.js";
import specialtyRoutes from "./specialty.routes.js";
import doctorRoutes from "./doctor.routes.js";
import patientRoutes from "./patient.routes.js";
import appointmentRoutes from "./appointment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/specialties", specialtyRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patient", patientRoutes);
router.use("/appointments", appointmentRoutes);

export default router;