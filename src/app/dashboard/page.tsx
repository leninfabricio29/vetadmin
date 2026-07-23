'use client';

import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useClients } from '../../hooks/useClients';
import { useSales } from '../../hooks/useSales';
import { useCashRegister } from '../../hooks/useCashRegister';
import { useReports } from '../../hooks/useReports';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/auth.store';
import {
  TrendingUp,
  Wallet,
  Users,
  PawPrint,
  AlertTriangle,
  ShoppingCart,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const { clients, isLoading: loadingClients } = useClients();
  const { sales, isLoading: loadingSales } = useSales();
  const { activeRegister, isOpen, isLoadingActive } = useCashRegister();
  const { lowStock, topProducts, isLoadingLowStock, isLoadingTopProducts } = useReports({ limit: 5 });

  // Compute daily sales totals
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySales = sales.filter((s) => {
    const saleDate = format(new Date(s.fecha), 'yyyy-MM-dd');
    return saleDate === todayStr && s.estado === 'Completada';
  });

  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.total, 0);

  const kpis = [
    {
      title: 'Ventas de Hoy',
      value: `$${todaySalesTotal.toFixed(2)}`,
      subtitle: `${todaySales.length} transacciones`,
      icon: TrendingUp,
      loading: loadingSales,
      color: 'text-green-650 bg-green-50'
    },
    {
      title: 'Estado de Caja',
      value: isOpen && activeRegister ? `$${activeRegister.efectivoEsperado.toFixed(2)}` : 'Cerrada',
      subtitle: isOpen ? 'Caja activa abierta' : 'No hay turno activo',
      icon: Wallet,
      loading: isLoadingActive,
      color: isOpen ? 'text-blue-650 bg-blue-50' : 'text-zinc-500 bg-zinc-50'
    },
    {
      title: 'Clientes Totales',
      value: clients.length.toString(),
      subtitle: 'Clientes registrados',
      icon: Users,
      loading: loadingClients,
      color: 'text-zinc-700 bg-zinc-100'
    }
  ];

  const { user } = useAuthStore();

  return (
    <div className="space-y-8 select-none">
      {/* Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Vista General</h1>
          <p className="text-xs text-zinc-500 mt-1">Indicadores principales del sistema veterinario.</p>
        </div>
        {user?.veterinaria && (
          <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-zinc-900 pl-3 sm:pl-0 sm:pr-3">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{user.veterinaria.nombre}</h2>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">RUC: {user.veterinaria.RUC}</p>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:shadow-xs transition-shadow">
              {kpi.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">{kpi.title}</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1 tracking-tight">{kpi.value}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{kpi.subtitle}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dashboard Sub-Section Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Last Sales List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Últimas Ventas Realizadas" subtitle="Detalle de facturación reciente.">
            {loadingSales ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-450">No hay ventas registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-100">
                      <th className="pb-3">Cliente</th>
                      <th className="pb-3">Fecha</th>
                      <th className="pb-3">Método</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {sales.slice(0, 5).map((sale) => {
                    const clientName = (sale.cliente && typeof sale.cliente === 'object') 
                      ? `${sale.cliente.nombres} ${sale.cliente.apellidos}` 
                      : 'Cliente General';
                      return (
                        <tr key={sale._id} className="text-zinc-650 hover:bg-zinc-50/50">
                          <td className="py-3 font-medium text-zinc-900 truncate max-w-[150px]">{clientName}</td>
                          <td className="py-3 text-xs">
                            {format(new Date(sale.fecha), 'd MMM, h:mm a', { locale: es })}
                          </td>
                          <td className="py-3 text-xs">{sale.métodoPago}</td>
                          <td className="py-3">
                            <Badge variant={sale.estado === 'Completada' ? 'success' : 'danger'}>
                              {sale.estado}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-bold text-zinc-900">${sale.total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Columns: Alerts and Tops */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <Card title="Alerta de Stock Bajo" subtitle="Productos al límite o agotados.">
            {isLoadingLowStock ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : lowStock.length === 0 ? (
              <div className="text-center py-6 text-xs text-green-700 font-medium">
                🎉 Todos los productos tienen stock suficiente.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 4).map((prod) => (
                  <div key={prod._id} className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-150 bg-zinc-50/50 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 truncate">{prod.nombre}</p>
                      <p className="text-[10px] text-zinc-450 mt-0.5">Mínimo: {prod.stockMínimo} {prod.unidad}</p>
                    </div>
                    <Badge variant={prod.stock === 0 ? 'danger' : 'warning'}>
                      {prod.stock === 0 ? 'Agotado' : `${prod.stock} disp.`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Selling Products */}
          <Card title="Productos Más Vendidos" subtitle="Artículos de alta rotación.">
            {isLoadingTopProducts ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-450">No hay ventas registradas aún.</div>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 4).map((item, idx) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-700 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{item.producto.nombre}</p>
                      <p className="text-[10px] text-zinc-450 mt-0.5">Vendidos: {item.cantidadVendida} uds.</p>
                    </div>
                    <span className="text-xs font-bold text-zinc-900">${item.totalRecaudado.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
