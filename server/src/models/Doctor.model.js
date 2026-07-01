import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: [true, "Specialty is required"],
    },
    qualifications: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number, // years
      default: 0,
    },
    bio: {
      type: String,
      default: "",
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
    },
    avatar: {
      type: String,
      default: "",
    },
    availability: [
      {
        day: {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        slots: [String], // e.g. ["09:00", "09:30", "10:00"]
      },
    ],
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "doctor",
      immutable: true,
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // doctors are created by admin only
    },
  avatar: { type: String, default: "" },
signature: {
  url: { type: String, default: "" },
  publicId: { type: String, default: "" },
},
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

doctorSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

doctorSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;