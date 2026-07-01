import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String, // Rich HTML content from editor
      required: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    diagnosis: { type: String, default: "" },
    prescription: { type: String, default: "" },
    followUpDate: { type: Date },
    pdfUrl: { type: String, default: "" },
    pdfPublicId: { type: String, default: "" },
    pdfExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
    deletedByPatient: { type: Boolean, default: false },
    deletedByDoctor: { type: Boolean, default: false },
    // AI Summary for patient
    aiSummary: { type: String, default: "" },
    aiPrecautions: [{ type: String }],
    aiRecommendations: [{ type: String }],
  },
  { timestamps: true }
);

const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema);
export default MedicalReport;