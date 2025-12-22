import api from '@/lib/api';

export const appointmentService = {
  getAll: (tenant: string, params?: { date?: string; doctorId?: string }) => 
    api.get(`/${tenant}/appointments`, { params }),
  
  getById: (tenant: string, id: string) => 
    api.get(`/${tenant}/appointments/${id}`),
  
  create: (tenant: string, data: any) => 
    api.post(`/${tenant}/appointments`, data),
  
  update: (tenant: string, id: string, data: any) => 
    api.patch(`/${tenant}/appointments/${id}`, data),
  
  delete: (tenant: string, id: string) => 
    api.delete(`/${tenant}/appointments/${id}`),
};