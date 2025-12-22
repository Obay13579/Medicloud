import api from '@/lib/api';

export const emrService = {
  createRecord: (tenant: string, data: any) => 
    api.post(`/${tenant}/records`, data),
  
  getRecordById: (tenant: string, id: string) => 
    api.get(`/${tenant}/records/${id}`),
};