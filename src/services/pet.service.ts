import { apiClient } from '../lib/axios';
import { IPet } from '../interfaces/api.interface';

export const petService = {
  getAll: async (): Promise<IPet[]> => {
    const { data } = await apiClient.get('/pets');
    return data.data;
  },
  getById: async (id: string): Promise<IPet> => {
    const { data } = await apiClient.get(`/pets/${id}`);
    return data.data;
  },
  getByOwner: async (clientId: string): Promise<IPet[]> => {
    const { data } = await apiClient.get(`/pets/owner/${clientId}`);
    return data.data;
  },
  create: async (payload: any): Promise<IPet> => {
    const { data } = await apiClient.post('/pets', payload);
    return data.data;
  },
  update: async (id: string, payload: any): Promise<IPet> => {
    const { data } = await apiClient.put(`/pets/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<IPet> => {
    const { data } = await apiClient.delete(`/pets/${id}`);
    return data.data;
  },
};
