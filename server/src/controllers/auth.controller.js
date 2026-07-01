import User from "../models/User.model.js";
import Doctor from "../models/Doctor.model.js";
import Admin from "../models/Admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cookieOptions } from "../services/token.service.js";

// Helper to strip password before sending response
const sanitize = (doc) => {
  const obj = doc.toObject();
  delete obj.password;
  return obj;
};

// @desc    Register a new patient
// @route   POST /api/v1/auth/register
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, age, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password, phone, age, gender });
  const token = user.generateAuthToken();

  res
    .status(201)
    .cookie("token", token, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: sanitize(user), token, role: "patient" },
        "Registration successful"
      )
    );
});

// @desc    Login (works for patient, doctor, admin based on role in body)
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
  if (!account) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await account.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
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

// @desc    Get currently logged-in user's profile
// @route   GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitize(req.user), role: req.role },
        "User fetched successfully"
      )
    );
});

export { registerPatient, login, logout, getMe };