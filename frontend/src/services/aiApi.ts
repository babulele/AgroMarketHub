import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000/api/v1';

const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (if needed)
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default aiApi;

