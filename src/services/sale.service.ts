import { apiClient } from '../lib/axios';
import { ISale } from '../interfaces/api.interface';

export const saleService = {
  create: async (payload: any): Promise<ISale> => {
    const { data } = await apiClient.post('/sales', payload);
    return data.data;
  },
  getAll: async (): Promise<ISale[]> => {
    const { data } = await apiClient.get('/sales');
    return data.data;
  },
  getById: async (id: string): Promise<ISale> => {
    const { data } = await apiClient.get(`/sales/${id}`);
    return data.data;
  },
  annul: async (id: string): Promise<ISale> => {
    const { data } = await apiClient.post(`/sales/${id}/annul`);
    return data.data;
  },
};
