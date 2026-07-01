import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
} from "../controllers/patient.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken, restrictTo("patient"));

router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);
router.patch("/change-password", changePassword);

export default router;