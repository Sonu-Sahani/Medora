import Specialty from "../models/Specialty.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all specialties
// @route   GET /api/v1/specialties
const getAllSpecialties = asyncHandler(async (req, res) => {
  const specialties = await Specialty.find().sort({ name: 1 });
  res
    .status(200)
    .json(new ApiResponse(200, specialties, "Specialties fetched successfully"));
});

// @desc    Get single specialty by slug
// @route   GET /api/v1/specialties/:slug
const getSpecialtyBySlug = asyncHandler(async (req, res) => {
  const specialty = await Specialty.findOne({ slug: req.params.slug });
  if (!specialty) {
    throw new ApiError(404, "Specialty not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, specialty, "Specialty fetched successfully"));
});

// @desc    Create a new specialty (admin only)
// @route   POST /api/v1/specialties
const createSpecialty = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  const existing = await Specialty.findOne({ slug });
  if (existing) {
    throw new ApiError(409, "This specialty already exists");
  }

  const specialty = await Specialty.create({ name, slug, description, icon });
  res
    .status(201)
    .json(new ApiResponse(201, specialty, "Specialty created successfully"));
});

// @desc    Update specialty (admin only)
// @route   PATCH /api/v1/specialties/:id
const updateSpecialty = asyncHandler(async (req, res) => {
  const specialty = await Specialty.findById(req.params.id);
  if (!specialty) {
    throw new ApiError(404, "Specialty not found");
  }

  const { name, description, icon } = req.body;
  if (name) {
    specialty.name = name;
    specialty.slug = name.toLowerCase().trim().replace(/\s+/g, "-");
  }
  if (description !== undefined) specialty.description = description;
  if (icon !== undefined) specialty.icon = icon;

  await specialty.save();
  res
    .status(200)
    .json(new ApiResponse(200, specialty, "Specialty updated successfully"));
});

// @desc    Delete specialty (admin only)
// @route   DELETE /api/v1/specialties/:id
const deleteSpecialty = asyncHandler(async (req, res) => {
  const specialty = await Specialty.findById(req.params.id);
  if (!specialty) {
    throw new ApiError(404, "Specialty not found");
  }
  await specialty.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Specialty deleted successfully"));
});

export {
  getAllSpecialties,
  getSpecialtyBySlug,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};