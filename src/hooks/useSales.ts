import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from '../services/sale.service';
import { useSalesStore } from '../store/sales.store';
import toast from 'react-hot-toast';

export const useSales = () => {
  const queryClient = useQueryClient();
  const clearCart = useSalesStore((state) => state.clearCart);

  const salesQuery = useQuery({
    queryKey: ['sales'],
    queryFn: () => saleService.getAll(),
  });

  const createSaleMutation = useMutation({
    mutationFn: (payload: any) => saleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['activeCashRegister'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      clearCart();
      toast.success('Venta procesada exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al procesar la venta.');
    },
  });

  const annulSaleMutation = useMutation({
    mutationFn: (id: string) => saleService.annul(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['activeCashRegister'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Venta anulada y stock devuelto exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al anular la venta.');
    },
  });

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    error: salesQuery.error,
    refetch: salesQuery.refetch,
    createSale: createSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending,
    annulSale: annulSaleMutation.mutateAsync,
    isAnnulling: annulSaleMutation.isPending,
  };
};
