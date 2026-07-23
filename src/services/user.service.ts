import { apiClient } from '../lib/axios';
import { IUser } from '../interfaces/api.interface';

export const userService = {
  getAll: async (): Promise<IUser[]> => {
    const { data } = await apiClient.get('/users');
    return data.data;
  },
  getById: async (id: string): Promise<IUser> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
  },
  create: async (payload: any): Promise<IUser> => {
    const { data } = await apiClient.post('/users', payload);
    return data.data;
  },
  update: async (id: string, payload: any): Promise<IUser> => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<IUser> => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data.data;
  },
};
