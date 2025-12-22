import api from '@/lib/api';

export const patientService = {
  getAll: (tenant: string) => 
    api.get(`/${tenant}/patients`),
  
  getById: (tenant: string, id: string) => 
    api.get(`/${tenant}/patients/${id}`),
  
  create: (tenant: string, data: any) => 
    api.post(`/${tenant}/patients`, data),
  
  update: (tenant: string, id: string, data: any) => 
    api.patch(`/${tenant}/patients/${id}`, data),
  
  delete: (tenant: string, id: string) => 
    api.delete(`/${tenant}/patients/${id}`),
  
  getRecords: (tenant: string, patientId: string) => 
    api.get(`/${tenant}/patients/${patientId}/records`),
};