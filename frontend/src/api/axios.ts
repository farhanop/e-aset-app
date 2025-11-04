// frontend/src/api/axios.ts
import axios from "axios";

// Gunakan environment variable atau fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response Success:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    if (error.response) {
      // Server responded with error status
      console.error("Error response data:", error.response.data);

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log("Unauthorized access, clearing tokens...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];

        // Only redirect if not already on login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      throw new Error(error.response.data.message || "Server error");
    } else if (error.request) {
      // No response received - kemungkinan CORS atau network issue
      console.error("No response received:", error.request);
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi jaringan.");
    } else {
      // Error in request setup
      console.error("Request setup error:", error.message);
      throw new Error(error.message);
    }
  }
);

export default api;
