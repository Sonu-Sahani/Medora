import axiosInstance from "./axiosInstance.js";

export const getSpecialtiesApi = () =>
  axiosInstance.get("/specialties");

export const getDoctorsBySpecialtyApi = (specialtyId, search = "") =>
  axiosInstance.get(`/doctors?specialty=${specialtyId}&search=${search}`);

export const getAllDoctorsApi = (search = "") =>
  axiosInstance.get(`/doctors?search=${search}`);

export const getDoctorByIdApi = (id) =>
  axiosInstance.get(`/doctors/${id}`);

export const getMyProfileApi = () =>
  axiosInstance.get("/patient/profile");

export const updateMyProfileApi = (data) =>
  axiosInstance.patch("/patient/profile", data);

export const changePasswordApi = (data) =>
  axiosInstance.patch("/patient/change-password", data);