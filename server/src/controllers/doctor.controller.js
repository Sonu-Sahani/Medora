import Doctor from "../models/Doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all doctors (with optional specialty filter + search)
// @route   GET /api/v1/doctors?specialty=<slug>&search=<text>
const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialty, search } = req.query;

  const filter = { isActive: true };

  if (specialty) {
    // specialty query param is the specialty's ObjectId (frontend will send it)
    filter.specialty = specialty;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const doctors = await Doctor.find(filter)
    .populate("specialty", "name slug")
    .select("-password")
    .sort({ ratingsAverage: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});

// @desc    Get single doctor by ID (full profile)
// @route   GET /api/v1/doctors/:id
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate("specialty", "name slug")
    .select("-password");

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, doctor, "Doctor fetched successfully"));
});

// @desc    Update doctor's own profile (doctor only)
// @route   PATCH /api/v1/doctors/profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "phone",
    "bio",
    "qualifications",
    "experience",
    "consultationFee",
    "availability",
    "avatar",
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const doctor = await Doctor.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, doctor, "Profile updated successfully"));
});

export { getAllDoctors, getDoctorById, updateMyProfile };