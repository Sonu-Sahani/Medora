import { Router } from "express";
import {
  getAllDoctors,
  getDoctorById,
  updateMyProfile,
  getDashboardStats,
  getDoctorAppointments,
  updateAppointmentStatus,
  changeDoctorPassword,
} from "../controllers/doctor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

// Public (any logged-in user)
router.get("/", verifyToken, getAllDoctors);
router.get("/:id", verifyToken, getDoctorById);

// Doctor-only routes
router.use(verifyToken, restrictTo("doctor"));
router.get("/me/dashboard-stats", getDashboardStats);
router.get("/me/appointments", getDoctorAppointments);
router.patch("/me/profile", updateMyProfile);
router.patch("/me/change-password", changeDoctorPassword);
router.patch("/me/appointments/:id/status", updateAppointmentStatus);

export default router;