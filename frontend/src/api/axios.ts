// frontend/src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request config:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
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
    console.log("Response received:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("Response error:", error);

    if (error.response) {
      // Server responded with error status
      console.error("Response error data:", error.response.data);

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
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
      // No response received
      console.error("Request error:", error.request);
      throw new Error("No response from server");
    } else {
      // Error in request setup
      console.error("Error:", error.message);
      throw new Error(error.message);
    }
  }
);

export default api;
