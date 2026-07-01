import axiosInstance from "./axiosInstance.js";

export const getTemplatesApi = () =>
  axiosInstance.get("/reports/templates");

export const createTemplateApi = (data) =>
  axiosInstance.post("/reports/templates", data);

export const updateTemplateApi = (id, data) =>
  axiosInstance.patch(`/reports/templates/${id}`, data);

export const deleteTemplateApi = (id) =>
  axiosInstance.delete(`/reports/templates/${id}`);

export const aiGenerateReportApi = (data) =>
  axiosInstance.post("/reports/ai-generate", data);

export const createReportApi = (data) =>
  axiosInstance.post("/reports", data);

// YAHAN NEW API ADD KI GAYI HAI
export const updateReportApi = (id, data) =>
  axiosInstance.patch(`/reports/${id}`, data);

export const getDoctorReportsApi = () =>
  axiosInstance.get("/reports/doctor");

export const getDoctorDraftsApi = () =>
  axiosInstance.get("/reports/doctor/drafts");

export const getPatientReportsApi = () =>
  axiosInstance.get("/reports/patient");

export const getReportByIdApi = (id) =>
  axiosInstance.get(`/reports/${id}`);

export const deleteReportApi = (id) =>
  axiosInstance.delete(`/reports/${id}`);