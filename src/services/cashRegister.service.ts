import { apiClient } from '../lib/axios';
import { ICashRegister, ICashMovement } from '../interfaces/api.interface';

export const cashRegisterService = {
  open: async (montoInicial: number): Promise<ICashRegister> => {
    const { data } = await apiClient.post('/cash-registers/open', { montoInicial });
    return data.data;
  },
  close: async (efectivoContado: number): Promise<ICashRegister> => {
    const { data } = await apiClient.post('/cash-registers/close', { efectivoContado });
    return data.data;
  },
  getActive: async (): Promise<ICashRegister> => {
    const { data } = await apiClient.get('/cash-registers/current');
    return data.data;
  },
  getAll: async (): Promise<ICashRegister[]> => {
    const { data } = await apiClient.get('/cash-registers');
    return data.data;
  },
  addMovement: async (payload: { tipo: 'Ingreso' | 'Egreso'; concepto: string; monto: number; descripción?: string }): Promise<ICashMovement> => {
    const { data } = await apiClient.post('/cash-registers/movements', payload);
    return data.data;
  },
  getMovements: async (cashRegisterId: string): Promise<ICashMovement[]> => {
    const { data } = await apiClient.get(`/cash-registers/movements/register/${cashRegisterId}`);
    return data.data;
  },
};
