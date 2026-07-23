'use client';

import React, { useState } from 'react';
import { useReports } from '../../../hooks/useReports';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Info } from 'lucide-react';
import { useUsers } from '../../../hooks/useUsers';
import { Select } from '../../../components/ui/Select';
import { useAuthStore } from '../../../store/auth.store';

export default function ReportsPage() {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const [startDate, setStartDate] = useState(format(thirtyDaysAgo, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [selectedUserId, setSelectedUserId] = useState('');

  const { users } = useUsers();

  const handlePresetDate = (preset: 'hoy' | 'semana' | 'mes' | '30dias') => {
    const t = new Date();
    let start = t;

    if (preset === 'hoy') {
      start = t;
    } else if (preset === 'semana') {
      start = new Date();
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
    } else if (preset === 'mes') {
      start = new Date(t.getFullYear(), t.getMonth(), 1);
    } else if (preset === '30dias') {
      start = subDays(t, 30);
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(t, 'yyyy-MM-dd'));
  };

  const {
    cashFlow,
    isLoadingCashFlow,
    inventoryMovements,
    isLoadingInventory,
    salesByDate,
    isLoadingSalesByDate,
    refetchAll
  } = useReports({ startDate, endDate, userId: selectedUserId || undefined });

  const handleFetch = () => {
    refetchAll();
  };

  const { user } = useAuthStore();

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Reportes y Auditoría</h1>
            <p className="text-xs text-zinc-500 mt-1">Consulta estadísticas de transacciones, flujos de efectivo y logs de inventario.</p>
          </div>
          {user?.veterinaria && (
            <div className="hidden sm:block border-l pl-4 border-zinc-200">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{user.veterinaria.nombre}</h2>
              <p className="text-[10px] text-zinc-450 font-mono mt-0.5">RUC: {user.veterinaria.RUC}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-3 shrink-0">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select
                label="Filtrar por Usuario"
                options={[
                  { label: 'Todos los Usuarios', value: '' },
                  ...users.map((u: any) => ({ label: `${u.nombres} ${u.apellidos}`, value: u._id }))
                ]}
                value={selectedUserId}
                onChange={(e: any) => setSelectedUserId(e.target.value)}
              />
              <Input
                label="Desde"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Hasta"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => handlePresetDate('hoy')}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-650 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md cursor-pointer transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate('semana')}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-650 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md cursor-pointer transition-colors"
              >
                Esta Semana
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate('mes')}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-650 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md cursor-pointer transition-colors"
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate('30dias')}
                className="px-2.5 py-1 text-[11px] font-semibold text-zinc-650 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md cursor-pointer transition-colors"
              >
                Últimos 30 días
              </button>
            </div>
          </div>
          <Button onClick={handleFetch} className="flex items-center gap-2 cursor-pointer font-semibold w-full sm:w-auto shrink-0 mb-0.5">
            <RefreshCw className="h-4 w-4" /> Consultar
          </Button>
        </div>
      </div>

      {/* Cash Flow summary section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-xs transition-shadow">
          {isLoadingCashFlow ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-500">Ingresos Totales (Ventas + Caja)</p>
                <p className="text-xl font-bold text-green-700 mt-1 tracking-tight">
                  +${cashFlow?.totalIngresos.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-xl text-green-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          )}
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          {isLoadingCashFlow ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-500">Egresos Totales (Caja manual)</p>
                <p className="text-xl font-bold text-red-750 mt-1 tracking-tight">
                  -${cashFlow?.totalEgresos.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded-xl text-red-700">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          )}
        </Card>

        <Card className="hover:shadow-xs transition-shadow bg-zinc-900 border-zinc-950 text-white">
          {isLoadingCashFlow ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400">Balance Neto del Rango</p>
                <p className={`text-xl font-bold mt-1 tracking-tight ${cashFlow && cashFlow.balance >= 0 ? 'text-green-450' : 'text-red-400'}`}>
                  ${cashFlow?.balance.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Commission splits summaries */}
      {(() => {
        const calculateCommissions = () => {
          let totalPrincipal = 0;
          let totalSecundario = 0;
          const workerCommissions: { [key: string]: { name: string; totalSales: number; commission: number } } = {};

          salesByDate.forEach((sale) => {
            if (sale.estado !== 'Completada') return;

            const principalAmt = sale.gananciaPrincipal || 0;
            const secundarioAmt = sale.gananciaSecundario || 0;

            totalPrincipal += principalAmt;
            totalSecundario += secundarioAmt;

            if (secundarioAmt > 0) {
              const userObj = sale.usuario;
              const userId = (userObj && typeof userObj === 'object') ? userObj._id : userObj || 'unknown';
              const userName = (userObj && typeof userObj === 'object') ? `${userObj.nombres} ${userObj.apellidos}` : 'Colaborador Secundario';

              if (!workerCommissions[userId]) {
                workerCommissions[userId] = {
                  name: userName,
                  totalSales: 0,
                  commission: 0
                };
              }
              workerCommissions[userId].totalSales += sale.total;
              workerCommissions[userId].commission += secundarioAmt;
            }
          });

          return {
            totalPrincipal,
            totalSecundario,
            workersList: Object.values(workerCommissions)
          };
        };

        const { totalPrincipal, totalSecundario, workersList } = calculateCommissions();

        return (
          <Card title="Distribución de Ganancias y Comisiones" subtitle="Resumen de comisiones devengadas por colaborador.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Ganancia Colaborador Principal</p>
                  <p className="text-xl font-extrabold text-zinc-900 mt-1 tracking-tight">${totalPrincipal.toFixed(2)}</p>
                </div>
                <span className="text-[9px] font-bold text-indigo-750 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 uppercase tracking-wide">Principal (Owner)</span>
              </div>
              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-zinc-500">Ganancia Colaboradores Secundarios</p>
                  <p className="text-xl font-extrabold text-zinc-900 mt-1 tracking-tight">${totalSecundario.toFixed(2)}</p>
                </div>
                <span className="text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5 uppercase tracking-wide">Secundarios (Workers)</span>
              </div>
            </div>

            {workersList.length === 0 ? (
              <div className="text-center py-4 text-xs text-zinc-400">No se registraron comisiones secundarias en este rango de fechas.</div>
            ) : (
              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                      <th className="px-4 py-2">Colaborador Secundario</th>
                      <th className="px-4 py-2 text-right">Volumen Ventas</th>
                      <th className="px-4 py-2 text-right">Comisión Asignada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-xs text-zinc-650">
                    {workersList.map((worker: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-50/30">
                        <td className="px-4 py-3 font-semibold text-zinc-900">{worker.name}</td>
                        <td className="px-4 py-3 text-right text-zinc-500">${worker.totalSales.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-green-750">${worker.commission.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date range sales transactions */}
        <Card title="Ventas Realizadas en el Rango" subtitle="Facturaciones liquidadas.">
          {isLoadingSalesByDate ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
          ) : salesByDate.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-450">No hay ventas registradas en las fechas seleccionadas.</div>
          ) : (
            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                    <th className="px-4 py-2">ID Factura</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Forma Pago</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs">
                  {salesByDate.map((sale) => (
                    <tr key={sale._id} className="text-zinc-650 hover:bg-zinc-50/30">
                      <td className="px-4 py-3 font-mono text-zinc-900">#{sale._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        {format(new Date(sale.fecha), 'dd MMM, hh:mm a', { locale: es })}
                      </td>
                      <td className="px-4 py-3">{sale.métodoPago}</td>
                      <td className="px-4 py-3 text-right font-bold text-zinc-900">${sale.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Inventory Movements Logs */}
        <Card title="Auditoría de Movimientos de Inventario" subtitle="Registro de variaciones de stock de productos.">
          {isLoadingInventory ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full animate-pulse" />
              <Skeleton className="h-10 w-full animate-pulse" />
            </div>
          ) : inventoryMovements.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-450">No hay movimientos registrados en las fechas seleccionadas.</div>
          ) : (
            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2 text-center">Variación</th>
                    <th className="px-4 py-2">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-xs">
                  {inventoryMovements.map((mov) => {
                    const prodName = (mov.producto && typeof mov.producto === 'object') ? mov.producto.nombre : 'Producto';
                    return (
                      <tr key={mov._id} className="text-zinc-650 hover:bg-zinc-50/30">
                        <td className="px-4 py-3">
                          {format(new Date(mov.fecha), 'dd MMM, hh:mm a', { locale: es })}
                        </td>
                        <td className="px-4 py-3 font-medium text-zinc-900 truncate max-w-[120px]">{prodName}</td>
                        <td className="px-4 py-3">
                          <Badge variant={mov.tipo === 'Ingreso' ? 'success' : 'danger'}>
                            {mov.tipo}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-zinc-900">
                          {mov.tipo === 'Ingreso' ? '+' : '-'}{mov.cantidad}
                        </td>
                        <td className="px-4 py-3 truncate max-w-[120px]" title={mov.motivo}>{mov.motivo}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
