import { Router } from "express";
import {
  getMyTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  aiGenerateReport,
  createReport,
  getDoctorReports,
  getPatientReports,
  getReportById,
  deleteReport,
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyToken);

// Templates (doctor only)
router.get("/templates", restrictTo("doctor"), getMyTemplates);
router.post("/templates", restrictTo("doctor"), createTemplate);
router.patch("/templates/:id", restrictTo("doctor"), updateTemplate);
router.delete("/templates/:id", restrictTo("doctor"), deleteTemplate);

// AI generation (doctor only)
router.post("/ai-generate", restrictTo("doctor"), aiGenerateReport);

// Reports
router.post("/", restrictTo("doctor"), createReport);
router.get("/doctor", restrictTo("doctor"), getDoctorReports);
router.get("/patient", restrictTo("patient"), getPatientReports);
router.get("/:id", getReportById);
router.delete("/:id", deleteReport);

export default router;