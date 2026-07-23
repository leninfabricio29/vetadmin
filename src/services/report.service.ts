import { apiClient } from '../lib/axios';
import { ISale, IProduct, IInventoryMovement } from '../interfaces/api.interface';

export const reportService = {
  getSalesByDate: async (startDate: string, endDate: string, userId?: string): Promise<ISale[]> => {
    const { data } = await apiClient.get('/reports/sales', { params: { startDate, endDate, userId } });
    return data.data;
  },
  getSalesByClient: async (clientId: string): Promise<ISale[]> => {
    const { data } = await apiClient.get(`/reports/sales/client/${clientId}`);
    return data.data;
  },
  getSalesByUser: async (userId: string): Promise<ISale[]> => {
    const { data } = await apiClient.get(`/reports/sales/user/${userId}`);
    return data.data;
  },
  getSalesByProduct: async (productId: string): Promise<ISale[]> => {
    const { data } = await apiClient.get(`/reports/sales/product/${productId}`);
    return data.data;
  },
  getLowStock: async (): Promise<IProduct[]> => {
    const { data } = await apiClient.get('/reports/low-stock');
    return data.data;
  },
  getTopProducts: async (limit?: number): Promise<any[]> => {
    const { data } = await apiClient.get('/reports/top-products', { params: { limit } });
    return data.data;
  },
  getCashFlow: async (startDate?: string, endDate?: string): Promise<{ totalIngresos: number; totalEgresos: number; balance: number; movimientosCount: number }> => {
    const { data } = await apiClient.get('/reports/cash-flow', { params: { startDate, endDate } });
    return data.data;
  },
  getInventoryMovements: async (startDate?: string, endDate?: string): Promise<IInventoryMovement[]> => {
    const { data } = await apiClient.get('/reports/inventory-movements', { params: { startDate, endDate } });
    return data.data;
  },
};
