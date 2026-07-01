import axiosInstance from "./axiosInstance.js";

export const getDoctorDashboardStatsApi = () =>
  axiosInstance.get("/doctors/me/dashboard-stats");

export const getDoctorAppointmentsApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosInstance.get(`/doctors/me/appointments?${query}`);
};

export const updateAppointmentStatusApi = (id, status, reason = "") =>
  axiosInstance.patch(`/doctors/me/appointments/${id}/status`, {
    status,
    reason,
  });

export const updateDoctorProfileApi = (data) =>
  axiosInstance.patch("/doctors/me/profile", data);

export const changeDoctorPasswordApi = (data) =>
  axiosInstance.patch("/doctors/me/change-password", data);