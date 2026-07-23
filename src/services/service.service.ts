import { apiClient } from '../lib/axios';
import { IService } from '../interfaces/api.interface';

export const serviceService = {
  getAll: async (): Promise<IService[]> => {
    const { data } = await apiClient.get('/services');
    return data.data;
  },
  getById: async (id: string): Promise<IService> => {
    const { data } = await apiClient.get(`/services/${id}`);
    return data.data;
  },
  create: async (payload: any): Promise<IService> => {
    const { data } = await apiClient.post('/services', payload);
    return data.data;
  },
  update: async (id: string, payload: any): Promise<IService> => {
    const { data } = await apiClient.put(`/services/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<IService> => {
    const { data } = await apiClient.delete(`/services/${id}`);
    return data.data;
  },
};
