import api from '@/lib/api';

export const prescriptionService = {
  getAll: (tenant: string, params?: { status?: string }) => 
    api.get(`/${tenant}/prescriptions`, { params }),
  
  getById: (tenant: string, id: string) => 
    api.get(`/${tenant}/prescriptions/${id}`),
  
  create: (tenant: string, data: any) => 
    api.post(`/${tenant}/prescriptions`, data),
  
  updateStatus: (tenant: string, id: string, status: string) => 
    api.patch(`/${tenant}/prescriptions/${id}`, { status }),
};