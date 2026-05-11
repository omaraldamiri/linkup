import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      // Only redirect if the user was already authenticated (token exists)
      // A failed login/register returns 401 too — don't redirect for those
      if (token) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
