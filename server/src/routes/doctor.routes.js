import { Router } from "express";
import {
  getAllDoctors,
  getDoctorById,
  updateMyProfile,
  uploadSignature,
  deleteSignature,
  getDashboardStats,
  getDoctorAppointments,
  updateAppointmentStatus,
  changeDoctorPassword,
} from "../controllers/doctor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const router = Router();

// Public
router.get("/", verifyToken, getAllDoctors);
router.get("/:id", verifyToken, getDoctorById);

// Doctor only
router.use(verifyToken, restrictTo("doctor"));
router.get("/me/dashboard-stats", getDashboardStats);
router.get("/me/appointments", getDoctorAppointments);
router.patch("/me/profile", updateMyProfile);
router.patch("/me/change-password", changeDoctorPassword);
router.patch("/me/appointments/:id/status", updateAppointmentStatus);
router.post("/me/signature", uploadSingle("signature"), uploadSignature);
router.delete("/me/signature", deleteSignature);

export default router;