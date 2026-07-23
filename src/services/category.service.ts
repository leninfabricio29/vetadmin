import { apiClient } from '../lib/axios';
import { ICategory } from '../interfaces/api.interface';

export const categoryService = {
  getAll: async (): Promise<ICategory[]> => {
    const { data } = await apiClient.get('/categories');
    return data.data;
  },
  getById: async (id: string): Promise<ICategory> => {
    const { data } = await apiClient.get(`/categories/${id}`);
    return data.data;
  },
  create: async (payload: any): Promise<ICategory> => {
    const { data } = await apiClient.post('/categories', payload);
    return data.data;
  },
  update: async (id: string, payload: any): Promise<ICategory> => {
    const { data } = await apiClient.put(`/categories/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<ICategory> => {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data.data;
  },
};
