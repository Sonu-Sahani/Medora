import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import Doctor from "../models/Doctor.model.js";
import Admin from "../models/Admin.model.js";

// Verifies JWT token from cookie or Authorization header
const verifyToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let account;
  if (decoded.role === "patient") {
    account = await User.findById(decoded.id);
  } else if (decoded.role === "doctor") {
    account = await Doctor.findById(decoded.id);
  } else if (decoded.role === "admin") {
    account = await Admin.findById(decoded.id);
  }

  if (!account) {
    throw new ApiError(401, "Account not found. Please log in again.");
  }

  if (account.isActive === false) {
    throw new ApiError(403, "Your account has been deactivated.");
  }

  req.user = account; // attach account to request
  req.role = decoded.role;
  next();
});

export { verifyToken };