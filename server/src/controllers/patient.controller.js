import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

// @desc    Get my profile
// @route   GET /api/v1/patient/profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

// @desc    Update my profile
// @route   PATCH /api/v1/patient/profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name", "phone", "age", "gender",
    "bloodGroup", "address", "avatar",
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// @desc    Change password
// @route   PATCH /api/v1/patient/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.isPasswordCorrect(currentPassword);

  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export { getMyProfile, updateMyProfile, changePassword };