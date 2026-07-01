import { Router } from "express";
import {
  getAllDoctors,
  getDoctorById,
  updateMyProfile,
} from "../controllers/doctor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

// Public routes (patients browse doctors without needing special permission,
// but they must be logged in - any role)
router.get("/", verifyToken, getAllDoctors);
router.get("/:id", verifyToken, getDoctorById);

// Doctor-only route
router.patch(
  "/profile",
  verifyToken,
  restrictTo("doctor"),
  updateMyProfile
);

export default router;