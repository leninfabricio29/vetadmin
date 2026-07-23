import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IVeterinary {
  _id: string;
  nombre: string;
  RUC: string;
  dirección?: string;
  teléfono?: string;
  email: string;
  preferencias?: {
    tema: string;
  };
}

export interface UserProfile {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
  teléfono: string;
  usuario: string;
  rol: string;
  estado: string;
  veterinaria?: IVeterinary;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        if (typeof window !== 'undefined') {
          document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        }
        set({ token, user, isAuthenticated: true });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        set({ token: null, user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'vet-auth-storage',
    }
  )
);
