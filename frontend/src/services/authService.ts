import api from '@/lib/api';

export const authService = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/auth/register', data),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getMe: () => api.get('/auth/me'),
};