import Doctor from "../models/Doctor.model.js";
import Appointment from "../models/Appointment.model.js";
import MedicalReport from "../models/MedicalReport.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all doctors
// @route   GET /api/v1/doctors
const getAllDoctors = asyncHandler(async (req, res) => {
  const { specialty, search } = req.query;
  const filter = { isActive: true };
  if (specialty) filter.specialty = specialty;
  if (search) filter.name = { $regex: search, $options: "i" };

  const doctors = await Doctor.find(filter)
    .populate("specialty", "name slug")
    .select("-password")
    .sort({ ratingsAverage: -1 });

  res.status(200).json(new ApiResponse(200, doctors, "Doctors fetched"));
});

// @desc    Get single doctor
// @route   GET /api/v1/doctors/:id
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate("specialty", "name slug")
    .select("-password");
  if (!doctor) throw new ApiError(404, "Doctor not found");
  res.status(200).json(new ApiResponse(200, doctor, "Doctor fetched"));
});

// @desc    Update doctor profile (doctor only)
// @route   PATCH /api/v1/doctors/profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name", "phone", "bio", "qualifications",
    "experience", "consultationFee", "availability", "avatar",
  ];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const doctor = await Doctor.findByIdAndUpdate(req.user._id, updates, {
    new: true, runValidators: true,
  }).select("-password");

  res.status(200).json(new ApiResponse(200, doctor, "Profile updated"));
});

// @desc    Get doctor dashboard stats
// @route   GET /api/v1/doctors/dashboard-stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const doctorId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    totalReports,
    recentAppointments,
  ] = await Promise.all([
    Appointment.countDocuments({ doctor: doctorId }),
    Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
    }),
    Appointment.countDocuments({
      doctor: doctorId,
      status: { $in: ["pending", "confirmed"] },
    }),
    Appointment.countDocuments({ doctor: doctorId, status: "completed" }),
    MedicalReport.countDocuments({ doctor: doctorId, deletedByDoctor: false }),
    Appointment.find({ doctor: doctorId })
      .populate("patient", "name email")
      .populate("specialty", "name")
      .sort({ date: -1 })
      .limit(5),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalReports,
        recentAppointments,
      },
      "Dashboard stats fetched"
    )
  );
});

// @desc    Get doctor's appointments
// @route   GET /api/v1/doctors/appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = { doctor: req.user._id };

  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const appointments = await Appointment.find(filter)
    .populate("patient", "name email phone age gender bloodGroup")
    .populate("specialty", "name")
    .sort({ date: 1, slot: 1 });

  res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched"));
});

// @desc    Update appointment status (doctor)
// @route   PATCH /api/v1/doctors/appointments/:id/status
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["confirmed", "completed", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctor: req.user._id,
  });

  if (!appointment) throw new ApiError(404, "Appointment not found");

  appointment.status = status;
  if (status === "cancelled") {
    appointment.cancelledBy = "doctor";
    appointment.cancellationReason = req.body.reason || "";
  }
  await appointment.save();

  res.status(200).json(new ApiResponse(200, appointment, "Status updated"));
});

// @desc    Change doctor password
// @route   PATCH /api/v1/doctors/change-password
const changeDoctorPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both passwords are required");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const doctor = await Doctor.findById(req.user._id).select("+password");
  const isMatch = await doctor.isPasswordCorrect(currentPassword);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  doctor.password = newPassword;
  await doctor.save();

  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  getAllDoctors,
  getDoctorById,
  updateMyProfile,
  getDashboardStats,
  getDoctorAppointments,
  updateAppointmentStatus,
  changeDoctorPassword,
};