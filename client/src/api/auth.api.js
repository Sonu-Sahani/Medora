import axiosInstance from "./axiosInstance.js";

export const registerPatientApi = (data) =>
  axiosInstance.post("/auth/register", data);

export const loginApi = (data) => axiosInstance.post("/auth/login", data);

export const logoutApi = () => axiosInstance.post("/auth/logout");

export const getMeApi = () => axiosInstance.get("/auth/me");