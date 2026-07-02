import Review from "../models/Review.model.js";
import Appointment from "../models/Appointment.model.js";
import Doctor from "../models/Doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Recalculate doctor's average rating
const recalculateDoctorRating = async (doctorId) => {
  const stats = await Review.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: "$doctor",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const doctor = await Doctor.findById(doctorId);
  if (stats.length > 0) {
    doctor.ratingsAverage = Math.round(stats[0].avgRating * 10) / 10;
    doctor.ratingsCount = stats[0].count;
  } else {
    doctor.ratingsAverage = 0;
    doctor.ratingsCount = 0;
  }
  await doctor.save();
};

// @desc    Create a review for a completed appointment
// @route   POST /api/v1/reviews
const createReview = asyncHandler(async (req, res) => {
  const { appointmentId, rating, comment } = req.body;

  if (!appointmentId || !rating) {
    throw new ApiError(400, "Appointment and rating are required");
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to review this appointment");
  }

  if (appointment.status !== "completed") {
    throw new ApiError(400, "You can only review completed appointments");
  }

  const existing = await Review.findOne({ appointment: appointmentId });
  if (existing) {
    throw new ApiError(409, "You have already reviewed this appointment");
  }

  const review = await Review.create({
    patient: req.user._id,
    doctor: appointment.doctor,
    appointment: appointmentId,
    rating,
    comment: comment || "",
  });

  await recalculateDoctorRating(appointment.doctor);

  const populated = await Review.findById(review._id).populate("patient", "name");

  res.status(201).json(new ApiResponse(201, populated, "Review submitted successfully"));
});

// @desc    Get reviews for a doctor (public)
// @route   GET /api/v1/reviews/doctor/:doctorId
const getDoctorReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ doctor: req.params.doctorId })
    .populate("patient", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched"));
});

// @desc    Get my reviews (patient)
// @route   GET /api/v1/reviews/my
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ patient: req.user._id })
    .populate("doctor", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched"));
});

// @desc    Check if appointment is reviewed
// @route   GET /api/v1/reviews/check/:appointmentId
const checkReviewExists = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ appointment: req.params.appointmentId });
  res.status(200).json(new ApiResponse(200, { reviewed: !!review, review }, "Checked"));
});

// @desc    Update my review
// @route   PATCH /api/v1/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await Review.findOne({ _id: req.params.id, patient: req.user._id });

  if (!review) throw new ApiError(404, "Review not found");

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  await recalculateDoctorRating(review.doctor);

  res.status(200).json(new ApiResponse(200, review, "Review updated"));
});

// @desc    Delete my review
// @route   DELETE /api/v1/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, patient: req.user._id });
  if (!review) throw new ApiError(404, "Review not found");

  const doctorId = review.doctor;
  await review.deleteOne();
  await recalculateDoctorRating(doctorId);

  res.status(200).json(new ApiResponse(200, {}, "Review deleted"));
});

export {
  createReview,
  getDoctorReviews,
  getMyReviews,
  checkReviewExists,
  updateReview,
  deleteReview,
};