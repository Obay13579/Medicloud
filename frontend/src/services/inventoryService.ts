import api from '@/lib/api';

export const inventoryService = {
  getAll: (tenant: string) => 
    api.get(`/${tenant}/inventory`),
  
  create: (tenant: string, data: any) => 
    api.post(`/${tenant}/inventory`, data),
  
  updateStock: (tenant: string, id: string, stock: number) => 
    api.patch(`/${tenant}/inventory/${id}`, { stock }),
};