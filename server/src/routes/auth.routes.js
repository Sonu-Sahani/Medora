import { Router } from "express";
import {
  registerPatient,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerPatientValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", registerPatientValidator, validate, registerPatient);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);

export default router;