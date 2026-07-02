import Doctor from "../models/Doctor.model.js";
import User from "../models/User.model.js";
import Admin from "../models/Admin.model.js";
import Appointment from "../models/Appointment.model.js";
import Specialty from "../models/Specialty.model.js";
import MedicalReport from "../models/MedicalReport.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { sendDoctorCredentials } from "../services/email.service.js";

// ==================== DASHBOARD ====================

// @route GET /api/v1/admin/dashboard-stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalDoctors,
    activeDoctors,
    totalPatients,
    totalAppointments,
    todayAppointments,
    completedAppointments,
    totalRevenue,
    totalReports,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Doctor.countDocuments({ isActive: true }),
    User.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    Appointment.countDocuments({ status: "completed" }),
    Appointment.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$payment.amount" } } },
    ]),
    MedicalReport.countDocuments(),
  ]);

  // Last 7 days appointments trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const appointmentTrend = await Appointment.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Specialty distribution
  const specialtyDistribution = await Doctor.aggregate([
    { $group: { _id: "$specialty", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "specialties",
        localField: "_id",
        foreignField: "_id",
        as: "specialty",
      },
    },
    { $unwind: "$specialty" },
    { $project: { name: "$specialty.name", count: 1, _id: 0 } },
  ]);

  const recentDoctors = await Doctor.find()
    .populate("specialty", "name")
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(
    new ApiResponse(200, {
      totalDoctors,
      activeDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalReports,
      appointmentTrend,
      specialtyDistribution,
      recentDoctors,
    }, "Dashboard stats fetched")
  );
});

// ==================== DOCTORS ====================

// @route GET /api/v1/admin/doctors
const getAllDoctorsAdmin = asyncHandler(async (req, res) => {
  const { search, specialty, status } = req.query;
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };
  if (specialty) filter.specialty = specialty;
  if (status) filter.isActive = status === "active";

  const doctors = await Doctor.find(filter)
    .populate("specialty", "name")
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, doctors, "Doctors fetched"));
});

// @route POST /api/v1/admin/doctors
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name, email, phone, specialtyId,
    qualifications, experience, bio, consultationFee,
  } = req.body;

  if (!name || !email || !specialtyId || !consultationFee) {
    throw new ApiError(400, "Name, email, specialty and fee are required");
  }

  const existing = await Doctor.findOne({ email });
  if (existing) throw new ApiError(409, "Doctor with this email already exists");

  const specialty = await Specialty.findById(specialtyId);
  if (!specialty) throw new ApiError(404, "Specialty not found");

  const password = generateRandomPassword();

  const doctor = await Doctor.create({
    name, email, phone, password,
    specialty: specialtyId,
    qualifications: qualifications || [],
    experience: experience || 0,
    bio: bio || "",
    consultationFee,
    createdBy: req.user._id,
  });

  // Send credentials email
  try {
    await sendDoctorCredentials(email, name, password, specialty.name);
  } catch (err) {
    console.error("Failed to send doctor credentials email:", err.message);
  }

  const populated = await Doctor.findById(doctor._id)
    .populate("specialty", "name")
    .select("-password");

  res.status(201).json(
    new ApiResponse(201, populated, "Doctor created and credentials sent via email")
  );
});

// @route PATCH /api/v1/admin/doctors/:id
const updateDoctor = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name", "phone", "bio", "qualifications",
    "experience", "consultationFee", "specialty", "isActive",
  ];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  }).populate("specialty", "name").select("-password");

  if (!doctor) throw new ApiError(404, "Doctor not found");

  res.status(200).json(new ApiResponse(200, doctor, "Doctor updated"));
});

// @route PATCH /api/v1/admin/doctors/:id/toggle-status
const toggleDoctorStatus = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  doctor.isActive = !doctor.isActive;
  await doctor.save();

  res.status(200).json(
    new ApiResponse(200, doctor, `Doctor ${doctor.isActive ? "activated" : "deactivated"}`)
  );
});

// @route DELETE /api/v1/admin/doctors/:id
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const activeAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    status: { $in: ["pending", "confirmed"] },
  });

  if (activeAppointments > 0) {
    throw new ApiError(
      400,
      "Cannot delete doctor with active appointments. Deactivate instead."
    );
  }

  await doctor.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Doctor deleted"));
});

// ==================== PATIENTS ====================

// @route GET /api/v1/admin/patients
const getAllPatientsAdmin = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };
  if (status) filter.isActive = status === "active";

  const patients = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, patients, "Patients fetched"));
});

// @route PATCH /api/v1/admin/patients/:id/toggle-status
const togglePatientStatus = asyncHandler(async (req, res) => {
  const patient = await User.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");

  patient.isActive = !patient.isActive;
  await patient.save();

  res.status(200).json(
    new ApiResponse(200, patient, `Patient ${patient.isActive ? "activated" : "deactivated"}`)
  );
});

// @route DELETE /api/v1/admin/patients/:id
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await User.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");

  const activeAppointments = await Appointment.countDocuments({
    patient: patient._id,
    status: { $in: ["pending", "confirmed"] },
  });

  if (activeAppointments > 0) {
    throw new ApiError(
      400,
      "Cannot delete patient with active appointments. Deactivate instead."
    );
  }

  await patient.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Patient deleted successfully"));
});

// ==================== APPOINTMENTS ====================

// @route GET /api/v1/admin/appointments
const getAllAppointmentsAdmin = asyncHandler(async (req, res) => {
  const { status, date, search } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  let appointments = await Appointment.find(filter)
    .populate("patient", "name email")
    .populate("doctor", "name")
    .populate("specialty", "name")
    .sort({ date: -1 });

  if (search) {
    const s = search.toLowerCase();
    appointments = appointments.filter(
      (a) =>
        a.patient?.name?.toLowerCase().includes(s) ||
        a.doctor?.name?.toLowerCase().includes(s)
    );
  }

  res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched"));
});

// ==================== ADMIN PROFILE ====================

// @route PATCH /api/v1/admin/profile
const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const admin = await Admin.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(200).json(new ApiResponse(200, admin, "Profile updated"));
});

// @route PATCH /api/v1/admin/change-password
const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both passwords required");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "Min 6 characters");
  }

  const admin = await Admin.findById(req.user._id).select("+password");
  const isMatch = await admin.isPasswordCorrect(currentPassword);
  if (!isMatch) throw new ApiError(400, "Current password incorrect");

  admin.password = newPassword;
  await admin.save();

  res.status(200).json(new ApiResponse(200, {}, "Password changed"));
});

export {
  getDashboardStats,
  getAllDoctorsAdmin,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  deleteDoctor,
  getAllPatientsAdmin,
  togglePatientStatus,
  deletePatient,
  getAllAppointmentsAdmin,
  updateAdminProfile,
  changeAdminPassword,
};