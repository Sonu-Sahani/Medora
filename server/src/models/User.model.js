import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: { type: String, trim: true },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: { type: String },
    address: { type: String },
    avatar: { type: String, default: "" },
    role: { type: String, default: "patient", immutable: true },
    isActive: { type: Boolean, default: true },

    // Email Verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyOTP: { type: String, select: false },
    emailVerifyOTPExpiry: { type: Date, select: false },

    // Password Reset
    resetPasswordOTP: { type: String, select: false },
    resetPasswordOTPExpiry: { type: Date, select: false },
    resetPasswordOTPVerified: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Generate OTP for email verification
userSchema.methods.generateEmailVerifyOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerifyOTP = crypto.createHash("sha256").update(otp).digest("hex");
  this.emailVerifyOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  return otp;
};

// Generate OTP for password reset
userSchema.methods.generateResetOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOTP = crypto.createHash("sha256").update(otp).digest("hex");
  this.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;
  this.resetPasswordOTPVerified = false;
  return otp;
};

const User = mongoose.model("User", userSchema);
export default User;