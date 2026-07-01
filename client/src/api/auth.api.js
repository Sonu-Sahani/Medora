import axiosInstance from "./axiosInstance.js";

export const registerPatientApi = (data) =>
  axiosInstance.post("/auth/register", data);

export const verifyEmailApi = (email, otp) =>
  axiosInstance.post("/auth/verify-email", { email, otp });

export const resendVerifyOTPApi = (email) =>
  axiosInstance.post("/auth/resend-verify-otp", { email });

export const loginApi = (data) =>
  axiosInstance.post("/auth/login", data);

export const logoutApi = () =>
  axiosInstance.post("/auth/logout");

export const getMeApi = () =>
  axiosInstance.get("/auth/me");

export const forgotPasswordApi = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const verifyOTPApi = (email, otp) =>
  axiosInstance.post("/auth/verify-otp", { email, otp });

export const resetPasswordApi = (email, newPassword) =>
  axiosInstance.post("/auth/reset-password", { email, newPassword });