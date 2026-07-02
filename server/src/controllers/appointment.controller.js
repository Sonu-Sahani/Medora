import Razorpay from "razorpay";
import crypto from "crypto";
import Appointment from "../models/Appointment.model.js";
import Doctor from "../models/Doctor.model.js";
import User from "../models/User.model.js";
import Specialty from "../models/Specialty.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} from "../services/email.service.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get available slots
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) throw new ApiError(400, "Doctor ID and date are required");

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[new Date(date).getDay()];

  const dayAvailability = doctor.availability.find((a) => a.day === dayName);
  if (!dayAvailability || dayAvailability.slots.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No slots available on this day"));
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ["cancelled"] },
  }).select("slot");

  const bookedSlots = bookedAppointments.map((a) => a.slot);
  const availableSlots = dayAvailability.slots.filter((slot) => !bookedSlots.includes(slot));

  res.status(200).json(new ApiResponse(200, availableSlots, "Available slots fetched"));
});

// @desc    Create Razorpay order
const createOrder = asyncHandler(async (req, res) => {
  const { doctorId, date, slot } = req.body;
  if (!doctorId || !date || !slot) throw new ApiError(400, "Doctor, date and slot are required");

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (!doctor.isActive) throw new ApiError(400, "Doctor is not available");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBooking = await Appointment.findOne({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    slot,
    status: { $nin: ["cancelled"] },
  });

  if (existingBooking) {
    throw new ApiError(409, "This slot is already booked. Please choose another.");
  }

  const amount = doctor.consultationFee * 100;

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `medora_${Date.now()}`,
    notes: { doctorId, patientId: req.user._id.toString(), date, slot },
  });

  res.status(200).json(
    new ApiResponse(200, {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      doctorName: doctor.name,
      consultationFee: doctor.consultationFee,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, "Order created successfully")
  );
});

// @desc    Verify payment and confirm booking
const verifyPaymentAndBook = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId, razorpayPaymentId, razorpaySignature,
    doctorId, date, slot, symptoms,
  } = req.body;

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed. Invalid signature.");
  }

  const doctor = await Doctor.findById(doctorId).populate("specialty", "name");
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    specialty: doctor.specialty._id,
    date: new Date(date),
    slot,
    symptoms: symptoms || "",
    status: "confirmed",
    payment: {
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      amount: doctor.consultationFee,
      currency: "INR",
      status: "paid",
    },
  });

  const populated = await Appointment.findById(appointment._id)
    .populate("doctor", "name specialty consultationFee")
    .populate("specialty", "name");

  // Send confirmation email (non-blocking)
  try {
    const patientUser = await User.findById(req.user._id).select("email name");
    await sendAppointmentConfirmation({
      email: patientUser.email,
      patientName: patientUser.name,
      doctorName: doctor.name,
      specialtyName: doctor.specialty.name,
      date,
      slot,
      fee: doctor.consultationFee,
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err.message);
  }

  res.status(201).json(new ApiResponse(201, populated, "Appointment booked successfully!"));
});

// @desc    Get my appointments
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { patient: req.user._id };
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("doctor", "name avatar specialty consultationFee")
    .populate("specialty", "name")
    .sort({ date: -1 });

  res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
});

// @desc    Cancel appointment
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this appointment");
  }
  if (appointment.status === "cancelled") throw new ApiError(400, "Appointment is already cancelled");
  if (appointment.status === "completed") throw new ApiError(400, "Cannot cancel a completed appointment");

  appointment.status = "cancelled";
  appointment.cancelledBy = "patient";
  appointment.cancellationReason = req.body.reason || "";
  await appointment.save();

  // Send cancellation email (non-blocking)
  try {
    const patientUser = await User.findById(appointment.patient).select("email name");
    const doctorInfo = await Doctor.findById(appointment.doctor).select("name");
    await sendAppointmentCancellation({
      email: patientUser.email,
      patientName: patientUser.name,
      doctorName: doctorInfo.name,
      date: appointment.date,
      slot: appointment.slot,
      cancelledBy: "you",
    });
  } catch (err) {
    console.error("Failed to send cancellation email:", err.message);
  }

  res.status(200).json(new ApiResponse(200, appointment, "Appointment cancelled successfully"));
});

export {
  getAvailableSlots,
  createOrder,
  verifyPaymentAndBook,
  getMyAppointments,
  cancelAppointment,
};