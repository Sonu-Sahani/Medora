import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // sends cookies (JWT) with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - handle global errors (like 401 unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired/invalid - we'll hook this into logout logic in Phase 1
      console.warn("Unauthorized - session may have expired");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;