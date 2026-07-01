import MedicalReport from "../models/MedicalReport.model.js";
import ReportTemplate from "../models/ReportTemplate.model.js";
import Appointment from "../models/Appointment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAIReport, generatePatientSummary } from "../services/ai.service.js";
import { generateReportPDF, deleteFromCloudinary } from "../services/pdf.service.js";

// ==================== TEMPLATES ====================

// @route GET /api/v1/reports/templates
const getMyTemplates = asyncHandler(async (req, res) => {
  const templates = await ReportTemplate.find({ doctor: req.user._id })
    .populate("specialty", "name slug")
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, templates, "Templates fetched"));
});

// @route POST /api/v1/reports/templates
const createTemplate = asyncHandler(async (req, res) => {
  const { name, content, quickPhrases, specialtyId, isDefault } = req.body;

  if (!name || !content || !specialtyId) {
    throw new ApiError(400, "Name, content and specialty are required");
  }

  const template = await ReportTemplate.create({
    doctor: req.user._id,
    specialty: specialtyId,
    name,
    content,
    quickPhrases: quickPhrases || [],
    isDefault: isDefault || false,
  });

  res.status(201).json(new ApiResponse(201, template, "Template created"));
});

// @route PATCH /api/v1/reports/templates/:id
const updateTemplate = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findOne({
    _id: req.params.id,
    doctor: req.user._id,
  });
  if (!template) throw new ApiError(404, "Template not found");

  const { name, content, quickPhrases, isDefault } = req.body;
  if (name) template.name = name;
  if (content) template.content = content;
  if (quickPhrases) template.quickPhrases = quickPhrases;
  if (isDefault !== undefined) template.isDefault = isDefault;

  await template.save();
  res.status(200).json(new ApiResponse(200, template, "Template updated"));
});

// @route DELETE /api/v1/reports/templates/:id
const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findOne({
    _id: req.params.id,
    doctor: req.user._id,
  });
  if (!template) throw new ApiError(404, "Template not found");
  await template.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Template deleted"));
});

// ==================== AI GENERATION ====================

// @route POST /api/v1/reports/ai-generate
const aiGenerateReport = asyncHandler(async (req, res) => {
  const { appointmentId, symptoms, doctorNotes, templateContent } = req.body;

  const appointment = await Appointment.findById(appointmentId)
    .populate("patient", "name age gender bloodGroup")
    .populate("specialty", "name slug");

  if (!appointment) throw new ApiError(404, "Appointment not found");
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  const aiContent = await generateAIReport({
    specialtySlug: appointment.specialty.slug,
    patientInfo: appointment.patient,
    symptoms: symptoms || appointment.symptoms,
    doctorNotes,
    templateContent,
  });

  res.status(200).json(
    new ApiResponse(200, { content: aiContent }, "AI report generated")
  );
});

// ==================== REPORTS ====================

// @route POST /api/v1/reports
// createReport function ke andar — doctor.specialty fetch karne ke baad
const createReport = asyncHandler(async (req, res) => {
  const {
    appointmentId, title, content,
    diagnosis, prescription, followUpDate,
    aiGenerated, status,
  } = req.body;

  const appointment = await Appointment.findById(appointmentId)
    .populate("patient", "name age gender bloodGroup email")
    .populate("specialty", "name slug");

  if (!appointment) throw new ApiError(404, "Appointment not found");
  if (appointment.doctor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  // Fetch doctor with signature
  const doctor = await (await import("../models/Doctor.model.js")).default
    .findById(req.user._id)
    .select("name qualifications signature");

  // Generate PDF with signature
  const pdfResult = await generateReportPDF({
    title,
    content,
    diagnosis,
    prescription,
    followUpDate,
    patient: appointment.patient,
    doctor: {
      name: doctor.name,
      qualifications: doctor.qualifications,
    },
    specialty: appointment.specialty,
    date: new Date(),
    signatureUrl: doctor.signature?.url || "",
  });

  // AI Summary if finalizing
  let aiSummary = "";
  let aiPrecautions = [];
  let aiRecommendations = [];

  if (status === "finalized" && process.env.GEMINI_API_KEY) {
    try {
      const summaryData = await generatePatientSummary({
        reportContent: content,
        patientName: appointment.patient.name,
        specialtyName: appointment.specialty.name,
      });
      aiSummary = summaryData.summary;
      aiPrecautions = summaryData.precautions;
      aiRecommendations = summaryData.recommendations;
    } catch (err) {
      console.error("AI summary failed:", err.message);
    }
  }

  const report = await MedicalReport.create({
    patient: appointment.patient._id,
    doctor: req.user._id,
    appointment: appointmentId,
    specialty: appointment.specialty._id,
    title, content,
    diagnosis: diagnosis || "",
    prescription: prescription || "",
    followUpDate: followUpDate || null,
    aiGenerated: aiGenerated || false,
    pdfUrl: pdfResult.url,
    pdfPublicId: pdfResult.publicId,
    status: status || "draft",
    aiSummary,
    aiPrecautions,
    aiRecommendations,
  });

  if (status === "finalized") {
    appointment.status = "completed";
    await appointment.save();
  }

  const populated = await MedicalReport.findById(report._id)
    .populate("patient", "name email")
    .populate("doctor", "name")
    .populate("specialty", "name");

  res.status(201).json(new ApiResponse(201, populated, "Report created"));
});

// @route GET /api/v1/reports/doctor
const getDoctorReports = asyncHandler(async (req, res) => {
  const reports = await MedicalReport.find({
    doctor: req.user._id,
    deletedByDoctor: false,
  })
    .populate("patient", "name email")
    .populate("specialty", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reports, "Reports fetched"));
});

// @route GET /api/v1/reports/patient
const getPatientReports = asyncHandler(async (req, res) => {
  const reports = await MedicalReport.find({
    patient: req.user._id,
    deletedByPatient: false,
    status: "finalized",
  })
    .populate("doctor", "name")
    .populate("specialty", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reports, "Reports fetched"));
});

// @route GET /api/v1/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id)
    .populate("patient", "name age gender bloodGroup email")
    .populate("doctor", "name specialty")
    .populate("specialty", "name");

  if (!report) throw new ApiError(404, "Report not found");

  // Check access
  const isDoctor = report.doctor._id.toString() === req.user._id.toString();
  const isPatient = report.patient._id.toString() === req.user._id.toString();

  if (!isDoctor && !isPatient) {
    throw new ApiError(403, "Not authorized to view this report");
  }

  res.status(200).json(new ApiResponse(200, report, "Report fetched"));
});

// @route DELETE /api/v1/reports/:id
const deleteReport = asyncHandler(async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);
  if (!report) throw new ApiError(404, "Report not found");

  const isDoctor = report.doctor.toString() === req.user._id.toString();
  const isPatient = report.patient.toString() === req.user._id.toString();

  if (!isDoctor && !isPatient) {
    throw new ApiError(403, "Not authorized");
  }

  if (isDoctor) report.deletedByDoctor = true;
  if (isPatient) report.deletedByPatient = true;

  // If both deleted — remove PDF from Cloudinary
  if (report.deletedByDoctor && report.deletedByPatient) {
    if (report.pdfPublicId) {
      await deleteFromCloudinary(report.pdfPublicId);
    }
    await report.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Report permanently deleted"));
  }

  await report.save();
  res.status(200).json(new ApiResponse(200, {}, "Report deleted successfully"));
});

// @route GET /api/v1/reports/doctor/drafts
const getDoctorDrafts = asyncHandler(async (req, res) => {
  const drafts = await MedicalReport.find({
    doctor: req.user._id,
    status: "draft",
    deletedByDoctor: false,
  })
    .populate("patient", "name email")
    .populate("specialty", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, drafts, "Drafts fetched"));
});

export {
  getMyTemplates, createTemplate, updateTemplate, deleteTemplate,
  aiGenerateReport, createReport, getDoctorReports, getDoctorDrafts,
  getPatientReports, getReportById, deleteReport,
};