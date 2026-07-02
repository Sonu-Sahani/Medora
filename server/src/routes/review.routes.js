import { Router } from "express";
import {
  createReview,
  getDoctorReviews,
  getMyReviews,
  checkReviewExists,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

// Public
router.get("/doctor/:doctorId", getDoctorReviews);

// Patient only
router.use(verifyToken, restrictTo("patient"));
router.post("/", createReview);
router.get("/my", getMyReviews);
router.get("/check/:appointmentId", checkReviewExists);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;