import crypto from "crypto";
import User from "../models/User.model.js";
import Doctor from "../models/Doctor.model.js";
import Admin from "../models/Admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../services/token.service.js";
import {
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
} from "../services/email.service.js";

const sanitize = (doc) => {
  const obj = doc.toObject();
  delete obj.password;
  return obj;
};

// @desc    Register patient - sends verification OTP
// @route   POST /api/v1/auth/register
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If registered but not verified, resend OTP
    if (!existingUser.isEmailVerified) {
      const otp = existingUser.generateEmailVerifyOTP();
      await existingUser.save({ validateBeforeSave: false });
      await sendEmailVerificationOTP(email, existingUser.name, otp);
      return res.status(200).json(
        new ApiResponse(
          200,
          { email, requiresVerification: true },
          "Account exists but not verified. OTP resent to your email."
        )
      );
    }
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name, email, password, phone, age, gender,
    isEmailVerified: false,
  });

  const otp = user.generateEmailVerifyOTP();
  await user.save({ validateBeforeSave: false });

  try {
  await sendEmailVerificationOTP(email, name, otp);
} catch (error) {
  console.error("EMAIL VERIFICATION ERROR:");
  console.error(error);

  await User.findByIdAndDelete(user._id);

  throw new ApiError(500, error.message);
}

  res.status(201).json(
    new ApiResponse(
      201,
      { email, requiresVerification: true },
      "Registration successful! Please verify your email."
    )
  );
});

// @desc    Verify email OTP after registration
// @route   POST /api/v1/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    emailVerifyOTP: hashedOTP,
    emailVerifyOTPExpiry: { $gt: Date.now() },
  }).select("+emailVerifyOTP +emailVerifyOTPExpiry");

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP. Please try again.");
  }

  user.isEmailVerified = true;
  user.emailVerifyOTP = undefined;
  user.emailVerifyOTPExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const token = user.generateAuthToken();

  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: sanitize(user), token, role: "patient" },
        "Email verified successfully! Welcome to Medora."
      )
    );
});

// @desc    Resend email verification OTP
// @route   POST /api/v1/auth/resend-verify-otp
const resendVerifyOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email }).select(
    "+emailVerifyOTP +emailVerifyOTPExpiry"
  );

  if (!user) throw new ApiError(404, "No account found with this email");
  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const otp = user.generateEmailVerifyOTP();
  await user.save({ validateBeforeSave: false });
  await sendEmailVerificationOTP(email, user.name, otp);

  res.status(200).json(
    new ApiResponse(200, { email }, "OTP resent successfully")
  );
});

// @desc    Login
// @route   POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!role || !["patient", "doctor", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid or missing role");
  }

  let Model;
  if (role === "patient") Model = User;
  if (role === "doctor") Model = Doctor;
  if (role === "admin") Model = Admin;

  const account = await Model.findOne({ email }).select("+password");
  if (!account) throw new ApiError(401, "Invalid email or password");

  const isPasswordValid = await account.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  // Only patients need email verification
  if (role === "patient" && !account.isEmailVerified) {
    // Resend OTP
    const otp = account.generateEmailVerifyOTP();
    await account.save({ validateBeforeSave: false });
    await sendEmailVerificationOTP(email, account.name, otp);
    throw new ApiError(
      403,
      "Email not verified. A new OTP has been sent to your email."
    );
  }

  if (account.isActive === false) {
    throw new ApiError(403, "Your account has been deactivated. Contact admin.");
  }

  const token = account.generateAuthToken();

  res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: sanitize(account), token, role },
        "Login successful"
      )
    );
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      { user: sanitize(req.user), role: req.role },
      "User fetched successfully"
    )
  );
});

// @desc    Forgot password - send OTP
// @route   POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "If this email is registered, an OTP has been sent."
      )
    );
  }

  const otp = user.generateResetOTP();
  await user.save({ validateBeforeSave: false });

  try {
  await sendPasswordResetOTP(user.email, user.name, otp);

  res.status(200).json(
    new ApiResponse(200, { email }, "OTP sent to your email address")
  );
} catch (error) {
  console.error("PASSWORD RESET EMAIL ERROR:");
  console.error(error);

  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  throw new ApiError(500, error.message);
}
});

// @desc    Verify reset OTP
// @route   POST /api/v1/auth/verify-otp
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpiry: { $gt: Date.now() },
  }).select("+resetPasswordOTP +resetPasswordOTPExpiry +resetPasswordOTPVerified");

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP. Please request a new one.");
  }

  user.resetPasswordOTPVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(200, { email }, "OTP verified successfully")
  );
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const user = await User.findOne({ email }).select(
    "+resetPasswordOTP +resetPasswordOTPExpiry +resetPasswordOTPVerified"
  );

  if (!user) throw new ApiError(404, "User not found");
  if (!user.resetPasswordOTPVerified) {
    throw new ApiError(400, "Please verify your OTP first");
  }
  if (user.resetPasswordOTPExpiry < Date.now()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpiry = undefined;
  user.resetPasswordOTPVerified = false;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, {}, "Password reset successfully. Please log in.")
  );
});

export {
  registerPatient,
  verifyEmail,
  resendVerifyOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
};