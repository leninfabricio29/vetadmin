import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/report.service';

export const useReports = (filters?: { startDate?: string; endDate?: string; limit?: number; userId?: string }) => {
  const queryClient = useQueryClient();
  const startDate = filters?.startDate || '';
  const endDate = filters?.endDate || '';
  const limit = filters?.limit || 5;
  const userId = filters?.userId || '';

  const lowStockQuery = useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: () => reportService.getLowStock(),
  });

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'top-products', limit],
    queryFn: () => reportService.getTopProducts(limit),
  });

  const cashFlowQuery = useQuery({
    queryKey: ['reports', 'cash-flow', startDate, endDate],
    queryFn: () => reportService.getCashFlow(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  const salesByDateQuery = useQuery({
    queryKey: ['reports', 'sales', startDate, endDate, userId],
    queryFn: () => reportService.getSalesByDate(startDate, endDate, userId || undefined),
    enabled: !!startDate && !!endDate,
  });

  const inventoryMovementsQuery = useQuery({
    queryKey: ['reports', 'inventory-movements', startDate, endDate],
    queryFn: () => reportService.getInventoryMovements(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  const operationalCostsQuery = useQuery({
    queryKey: ['reports', 'operational-costs', startDate, endDate],
    queryFn: () => reportService.getOperationalCosts(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });

  return {
    lowStock: lowStockQuery.data || [],
    isLoadingLowStock: lowStockQuery.isLoading,
    topProducts: topProductsQuery.data || [],
    isLoadingTopProducts: topProductsQuery.isLoading,
    cashFlow: cashFlowQuery.data,
    isLoadingCashFlow: cashFlowQuery.isLoading,
    salesByDate: salesByDateQuery.data || [],
    isLoadingSalesByDate: salesByDateQuery.isLoading,
    inventoryMovements: inventoryMovementsQuery.data || [],
    isLoadingInventory: inventoryMovementsQuery.isLoading,
    operationalCosts: operationalCostsQuery.data || [],
    isLoadingOperationalCosts: operationalCostsQuery.isLoading,
    refetchAll: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  };
};
