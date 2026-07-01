import axiosInstance from "./axiosInstance.js";

// Templates
export const getTemplatesApi = () =>
  axiosInstance.get("/reports/templates");

export const createTemplateApi = (data) =>
  axiosInstance.post("/reports/templates", data);

export const updateTemplateApi = (id, data) =>
  axiosInstance.patch(`/reports/templates/${id}`, data);

export const deleteTemplateApi = (id) =>
  axiosInstance.delete(`/reports/templates/${id}`);

// AI Generation
export const aiGenerateReportApi = (data) =>
  axiosInstance.post("/reports/ai-generate", data);

// Reports
export const createReportApi = (data) =>
  axiosInstance.post("/reports", data);

export const getDoctorReportsApi = () =>
  axiosInstance.get("/reports/doctor");

export const getPatientReportsApi = () =>
  axiosInstance.get("/reports/patient");

export const getReportByIdApi = (id) =>
  axiosInstance.get(`/reports/${id}`);

export const deleteReportApi = (id) =>
  axiosInstance.delete(`/reports/${id}`);