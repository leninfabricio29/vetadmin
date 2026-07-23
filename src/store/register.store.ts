import { create } from 'zustand';

export interface CashRegisterState {
  _id: string;
  montoInicial: number;
  montoFinal?: number;
  fechaApertura: string;
  fechaCierre?: string;
  usuario: any;
  ventas: number;
  ingresos: number;
  egresos: number;
  efectivoEsperado: number;
  efectivoContado?: number;
  diferencia?: number;
  estado: 'Abierta' | 'Cerrada';
}

interface RegisterState {
  activeRegister: CashRegisterState | null;
  isOpen: boolean;
  setActiveRegister: (register: CashRegisterState | null) => void;
  clearRegister: () => void;
}

export const useRegisterStore = create<RegisterState>((set) => ({
  activeRegister: null,
  isOpen: false,
  setActiveRegister: (register) =>
    set({ activeRegister: register, isOpen: register?.estado === 'Abierta' }),
  clearRegister: () => set({ activeRegister: null, isOpen: false }),
}));
