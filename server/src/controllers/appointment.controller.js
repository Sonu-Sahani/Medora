import Razorpay from "razorpay";
import crypto from "crypto";
import Appointment from "../models/Appointment.model.js";
import Doctor from "../models/Doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/v1/appointments/slots?doctorId=&date=
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    throw new ApiError(400, "Doctor ID and date are required");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  // Get day name from date
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[new Date(date).getDay()];

  const dayAvailability = doctor.availability.find((a) => a.day === dayName);
  if (!dayAvailability || dayAvailability.slots.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No slots available on this day"));
  }

  // Find already booked slots for this doctor on this date
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

  const availableSlots = dayAvailability.slots.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, availableSlots, "Available slots fetched")
    );
});

// @desc    Create Razorpay order (step 1 of booking)
// @route   POST /api/v1/appointments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { doctorId, date, slot, symptoms } = req.body;

  if (!doctorId || !date || !slot) {
    throw new ApiError(400, "Doctor, date and slot are required");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (!doctor.isActive) throw new ApiError(400, "Doctor is not available");

  // Check slot is still available
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

  // Create Razorpay order
  const amount = doctor.consultationFee * 100; // Razorpay expects paise

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `medora_${Date.now()}`,
    notes: {
      doctorId,
      patientId: req.user._id.toString(),
      date,
      slot,
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        doctorName: doctor.name,
        consultationFee: doctor.consultationFee,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Order created successfully"
    )
  );
});

// @desc    Verify payment and confirm booking (step 2)
// @route   POST /api/v1/appointments/verify-payment
const verifyPaymentAndBook = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    doctorId,
    date,
    slot,
    symptoms,
  } = req.body;

  // Verify signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed. Invalid signature.");
  }

  // Get doctor to fetch specialty
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  // Create appointment
  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    specialty: doctor.specialty,
    date: new Date(date),
    slot,
    symptoms: symptoms || "",
    status: "confirmed",
    payment: {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: doctor.consultationFee,
      currency: "INR",
      status: "paid",
    },
  });

  const populated = await Appointment.findById(appointment._id)
    .populate("doctor", "name specialty consultationFee")
    .populate("specialty", "name");

  res
    .status(201)
    .json(
      new ApiResponse(201, populated, "Appointment booked successfully!")
    );
});

// @desc    Get my appointments (patient)
// @route   GET /api/v1/appointments/my
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { patient: req.user._id };
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("doctor", "name avatar specialty consultationFee")
    .populate("specialty", "name")
    .sort({ date: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, appointments, "Appointments fetched successfully")
    );
});

// @desc    Cancel appointment (patient)
// @route   PATCH /api/v1/appointments/:id/cancel
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this appointment");
  }

  if (appointment.status === "cancelled") {
    throw new ApiError(400, "Appointment is already cancelled");
  }

  if (appointment.status === "completed") {
    throw new ApiError(400, "Cannot cancel a completed appointment");
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = "patient";
  appointment.cancellationReason = req.body.reason || "";
  await appointment.save();

  res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment cancelled successfully"));
});

export {
  getAvailableSlots,
  createOrder,
  verifyPaymentAndBook,
  getMyAppointments,
  cancelAppointment,
};