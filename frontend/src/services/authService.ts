import api from '@/lib/api';

export const authService = {
  // Register user dengan tenantId
  register: (data: { 
    tenantId: string;
    email: string; 
    password: string; 
    name: string; 
    role: string 
  }) => api.post('/auth/register', data),
  
  // Login dengan email dan password
  login: (credentials: { 
    email: string; 
    password: string 
  }) => api.post('/auth/login', credentials),
  
  getMe: () => api.get('/auth/me'),
  
  // Create tenant/klinik baru
  createTenant: (data: { name: string; slug: string }) =>
    api.post('/tenants', data),
};