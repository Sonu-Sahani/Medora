import { Router } from "express";
import {
  registerPatient,
  verifyEmail,
  resendVerifyOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerPatientValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", registerPatientValidator, validate, registerPatient);
router.post("/verify-email", verifyEmail);
router.post("/resend-verify-otp", resendVerifyOTP);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;