import { Router } from "express";
import {
  getAllSpecialties,
  getSpecialtyBySlug,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "../controllers/specialty.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllSpecialties);
router.get("/:slug", getSpecialtyBySlug);

// Admin-only routes
router.post("/", verifyToken, restrictTo("admin"), createSpecialty);
router.patch("/:id", verifyToken, restrictTo("admin"), updateSpecialty);
router.delete("/:id", verifyToken, restrictTo("admin"), deleteSpecialty);

export default router;