import { Router } from "express";
import {
  getDashboardStats,
  getAllDoctorsAdmin,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  deleteDoctor,
  getAllPatientsAdmin,
  togglePatientStatus,
  deletePatient,
  getAllAppointmentsAdmin,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken, restrictTo("admin"));

router.get("/dashboard-stats", getDashboardStats);

router.get("/doctors", getAllDoctorsAdmin);
router.post("/doctors", createDoctor);
router.patch("/doctors/:id", updateDoctor);
router.patch("/doctors/:id/toggle-status", toggleDoctorStatus);
router.delete("/doctors/:id", deleteDoctor);

router.get("/patients", getAllPatientsAdmin);
router.patch("/patients/:id/toggle-status", togglePatientStatus);
router.delete("/patients/:id", deletePatient);

router.get("/appointments", getAllAppointmentsAdmin);

router.patch("/profile", updateAdminProfile);
router.patch("/change-password", changeAdminPassword);

export default router;