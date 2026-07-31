import { apiClient } from '../lib/axios';
import { ISale, IProduct, IInventoryMovement, IOperationalCostDay } from '../interfaces/api.interface';

/**
 * Adjusts a date string (yyyy-MM-dd) to end-of-day ISO format (T23:59:59.999Z)
 * so that all records created during that day are included in range queries.
 * Without this, new Date("2026-07-31") → midnight UTC, excluding sales from
 * later that same day (e.g. 19:21 UTC).
 */
const toEndOfDay = (date: string): string => {
  if (!date) return date;
  // If already has time component, leave it as-is
  if (date.includes('T')) return date;
  return `${date}T23:59:59.999Z`;
};

export const reportService = {
  getSalesByDate: async (startDate: string, endDate: string, userId?: string): Promise<ISale[]> => {
    const { data } = await apiClient.get('/reports/sales', {
      params: { startDate, endDate: toEndOfDay(endDate), userId },
    });
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
    const { data } = await apiClient.get('/reports/cash-flow', {
      params: { startDate, endDate: endDate ? toEndOfDay(endDate) : undefined },
    });
    return data.data;
  },
  getInventoryMovements: async (startDate?: string, endDate?: string): Promise<IInventoryMovement[]> => {
    const { data } = await apiClient.get('/reports/inventory-movements', {
      params: { startDate, endDate: endDate ? toEndOfDay(endDate) : undefined },
    });
    return data.data;
  },
  getOperationalCosts: async (startDate: string, endDate: string): Promise<IOperationalCostDay[]> => {
    const { data } = await apiClient.get('/reports/operational-costs', {
      params: { startDate, endDate: toEndOfDay(endDate) },
    });
    return data.data;
  },
};
