import { apiClient } from '../lib/axios';
import { IProduct } from '../interfaces/api.interface';

export const productService = {
  getAll: async (): Promise<IProduct[]> => {
    const { data } = await apiClient.get('/products');
    return data.data;
  },
  getById: async (id: string): Promise<IProduct> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data.data;
  },
  create: async (payload: any): Promise<IProduct> => {
    const { data } = await apiClient.post('/products', payload);
    return data.data;
  },
  update: async (id: string, payload: any): Promise<IProduct> => {
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data.data;
  },
  delete: async (id: string): Promise<IProduct> => {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data.data;
  },
};
