import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.medicloudy.xyz/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if it's not a login/register request
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/');
      if (!isAuthRequest) {
        console.log('Session expired, logging out...');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;