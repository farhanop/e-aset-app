// frontend/src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', error.response.data);
      throw new Error(error.response.data.message || 'Server error');
    } else if (error.request) {
      // No response received
      console.error('Request error:', error.request);
      throw new Error('No response from server');
    } else {
      // Error in request setup
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

export default api;