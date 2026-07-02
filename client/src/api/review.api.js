import axiosInstance from "./axiosInstance.js";

export const createReviewApi = (data) =>
  axiosInstance.post("/reviews", data);

export const getDoctorReviewsApi = (doctorId) =>
  axiosInstance.get(`/reviews/doctor/${doctorId}`);

export const getMyReviewsApi = () =>
  axiosInstance.get("/reviews/my");

export const checkReviewExistsApi = (appointmentId) =>
  axiosInstance.get(`/reviews/check/${appointmentId}`);

export const updateReviewApi = (id, data) =>
  axiosInstance.patch(`/reviews/${id}`, data);

export const deleteReviewApi = (id) =>
  axiosInstance.delete(`/reviews/${id}`);