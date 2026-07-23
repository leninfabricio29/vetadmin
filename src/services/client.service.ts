import { apiClient } from '../lib/axios';
import { IClient } from '../interfaces/api.interface';

export const clientService = {
  getAll: async (search?: string): Promise<IClient[]> => {
    const params = search ? { search } : {};
    const { data } = await apiClient.get('/clients', { params });
    return data.data;
  },
  getById: async (id: string): Promise<IClient> => {
    const { data } = await apiClient.get(`/clients/${id}`);
    return data.data;
  },
  create: async (payload: any): Promise<IClient> => {
    const { data } = await apiClient.post('/clients', payload);
    return data.data;
  },
  update: async (id: string, payload: any): Promise<IClient> => {
    const { data } = await apiClient.put(`/clients/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<IClient> => {
    const { data } = await apiClient.delete(`/clients/${id}`);
    return data.data;
  },
};
