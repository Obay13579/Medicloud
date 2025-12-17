import axios from 'axios';

// 1. Ambil URL dari Environment Variable (Vite)
// Kalau tidak ada di .env, fallback ke localhost (Safety net)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 2. Buat Instance Axios
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor (Optional tapi Bagus)
// Otomatis pasang Token JWT kalau user sudah login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Asumsi token disimpan di sini
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. Error Handling Global (Biar gak crash kalau error)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kalau 401 Unauthorized (Token expired), lempar ke login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
