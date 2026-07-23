import { apiClient } from '../lib/axios';

export const authService = {
  login: async (usuario: string, contrasenia: string) => {
    const { data } = await apiClient.post('/auth/login', { usuario, contraseña: contrasenia });
    return data.data; // returns { token, user }
  },
  changePassword: async (contraseniaActual: string, contraseniaNueva: string) => {
    const { data } = await apiClient.post('/auth/change-password', { contraseniaActual, contraseniaNueva });
    return data;
  },
  getProfile: async () => {
    const { data } = await apiClient.get('/auth/profile');
    return data.data;
  },
  recoverPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/recover-password', { email });
    return data;
  },
};
