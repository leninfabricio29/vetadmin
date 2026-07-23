import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashRegisterService } from '../services/cashRegister.service';
import { useRegisterStore } from '../store/register.store';
import toast from 'react-hot-toast';

export const useCashRegister = (registerId?: string) => {
  const queryClient = useQueryClient();
  const setRegister = useRegisterStore((state) => state.setActiveRegister);
  const clearRegister = useRegisterStore((state) => state.clearRegister);

  const activeRegisterQuery = useQuery({
    queryKey: ['activeCashRegister'],
    queryFn: async () => {
      try {
        const data = await cashRegisterService.getActive();
        if (data) {
          setRegister(data);
        }
        return data;
      } catch (err) {
        clearRegister();
        throw err;
      }
    },
    retry: false,
  });

  const openMutation = useMutation({
    mutationFn: (montoInicial: number) => cashRegisterService.open(montoInicial),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeCashRegister'] });
      queryClient.invalidateQueries({ queryKey: ['cashRegisters'] });
      setRegister(data);
      toast.success('Caja abierta exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al abrir la caja.');
    },
  });

  const closeMutation = useMutation({
    mutationFn: (efectivoContado: number) => cashRegisterService.close(efectivoContado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCashRegister'] });
      queryClient.invalidateQueries({ queryKey: ['cashRegisters'] });
      clearRegister();
      toast.success('Caja cerrada exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al cerrar la caja.');
    },
  });

  const addMovementMutation = useMutation({
    mutationFn: (payload: { tipo: 'Ingreso' | 'Egreso'; concepto: string; monto: number; descripción?: string }) =>
      cashRegisterService.addMovement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCashRegister'] });
      queryClient.invalidateQueries({ queryKey: ['cashRegisters'] });
      if (registerId) {
        queryClient.invalidateQueries({ queryKey: ['cashMovements', registerId] });
      }
      toast.success('Movimiento registrado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar movimiento.');
    },
  });

  const registersQuery = useQuery({
    queryKey: ['cashRegisters'],
    queryFn: () => cashRegisterService.getAll(),
  });

  const movementsQuery = useQuery({
    queryKey: ['cashMovements', registerId],
    queryFn: () => (registerId ? cashRegisterService.getMovements(registerId) : Promise.resolve([])),
    enabled: !!registerId,
  });

  return {
    activeRegister: useRegisterStore((state) => state.activeRegister),
    isOpen: useRegisterStore((state) => state.isOpen),
    isLoadingActive: activeRegisterQuery.isLoading,
    refetchActive: activeRegisterQuery.refetch,
    openRegister: openMutation.mutateAsync,
    isOpening: openMutation.isPending,
    closeRegister: closeMutation.mutateAsync,
    isClosing: closeMutation.isPending,
    addMovement: addMovementMutation.mutateAsync,
    isAddingMovement: addMovementMutation.isPending,
    registers: registersQuery.data || [],
    isLoadingRegisters: registersQuery.isLoading,
    movements: movementsQuery.data || [],
    isLoadingMovements: movementsQuery.isLoading,
  };
};
