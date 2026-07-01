import mongoose from "mongoose";

const reportTemplateSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String, // HTML rich text
      required: true,
    },
    quickPhrases: [
      {
        label: String,
        text: String,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ReportTemplate = mongoose.model("ReportTemplate", reportTemplateSchema);
export default ReportTemplate;