import mongoose from "mongoose";

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String, // icon name or image URL
      default: "",
    },
  },
  { timestamps: true }
);

const Specialty = mongoose.model("Specialty", specialtySchema);
export default Specialty;