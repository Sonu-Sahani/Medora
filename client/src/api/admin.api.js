import axiosInstance from "./axiosInstance.js";

export const getAdminDashboardStatsApi = () =>
  axiosInstance.get("/admin/dashboard-stats");

// Doctors
export const getAllDoctorsAdminApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosInstance.get(`/admin/doctors?${query}`);
};

export const createDoctorApi = (data) =>
  axiosInstance.post("/admin/doctors", data);

export const updateDoctorApi = (id, data) =>
  axiosInstance.patch(`/admin/doctors/${id}`, data);

export const toggleDoctorStatusApi = (id) =>
  axiosInstance.patch(`/admin/doctors/${id}/toggle-status`);

export const deleteDoctorApi = (id) =>
  axiosInstance.delete(`/admin/doctors/${id}`);

// Patients
export const getAllPatientsAdminApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosInstance.get(`/admin/patients?${query}`);
};

export const togglePatientStatusApi = (id) =>
  axiosInstance.patch(`/admin/patients/${id}/toggle-status`);

// Appointments
export const getAllAppointmentsAdminApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axiosInstance.get(`/admin/appointments?${query}`);
};

// Profile
export const updateAdminProfileApi = (data) =>
  axiosInstance.patch("/admin/profile", data);

export const changeAdminPasswordApi = (data) =>
  axiosInstance.patch("/admin/change-password", data);

export const deletePatientApi = (id) =>
  axiosInstance.delete(`/admin/patients/${id}`);