import axiosInstance from "./axiosInstance.js";

export const getAvailableSlotsApi = (doctorId, date) =>
  axiosInstance.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`);

export const createOrderApi = (data) =>
  axiosInstance.post("/appointments/create-order", data);

export const verifyPaymentApi = (data) =>
  axiosInstance.post("/appointments/verify-payment", data);

export const getMyAppointmentsApi = (status = "") =>
  axiosInstance.get(`/appointments/my${status ? `?status=${status}` : ""}`);

export const cancelAppointmentApi = (id, reason = "") =>
  axiosInstance.patch(`/appointments/${id}/cancel`, { reason });