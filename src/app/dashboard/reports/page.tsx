'use client';

import React, { useState, useEffect } from 'react';
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
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Info, ChevronLeft, ChevronRight, ShoppingCart, Package, Percent, FileText, Users } from 'lucide-react';
import { useUsers } from '../../../hooks/useUsers';
import { Select } from '../../../components/ui/Select';
import { useAuthStore } from '../../../store/auth.store';

export default function ReportsPage() {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  const [startDate, setStartDate] = useState(format(thirtyDaysAgo, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [selectedUserId, setSelectedUserId] = useState('');

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'gastos' | 'ventas' | 'inventario'>('gastos');

  // Pagination states for each table
  const [salesPg, setSalesPg] = useState(1);
  const [salesSize, setSalesSize] = useState(10);
  const [invPg, setInvPg] = useState(1);
  const [invSize, setInvSize] = useState(5); // Default 5 per user request
  const [comPg, setComPg] = useState(1);
  const [comSize, setComSize] = useState(10);
  const [costPg, setCostPg] = useState(1);
  const [costSize, setCostSize] = useState(10);
  const [costViewMode, setCostViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const makePagination = <T,>(data: T[], page: number, size: number) => {
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / size));
    const safePg = Math.min(page, totalPages);
    const start = (safePg - 1) * size;
    const end = Math.min(start + size, total);
    const pageNums = (): (number | '...')[] => {
      const pages: (number | '...')[] = [];
      if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
      else {
        pages.push(1);
        if (safePg > 3) pages.push('...');
        const s = Math.max(2, safePg - 1);
        const e = Math.min(totalPages - 1, safePg + 1);
        for (let i = s; i <= e; i++) pages.push(i);
        if (safePg < totalPages - 2) pages.push('...');
        pages.push(totalPages);
      }
      return pages;
    };
    return { total, totalPages, safePg, start, end, paged: data.slice(start, end), pageNums };
  };

  // Reset pagination when dates change
  useEffect(() => { setSalesPg(1); setInvPg(1); setComPg(1); setCostPg(1); setExpandedDay(null); }, [startDate, endDate, selectedUserId]);

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
    operationalCosts,
    isLoadingOperationalCosts,
    refetchAll
  } = useReports({ startDate, endDate, userId: selectedUserId || undefined });

  const handleFetch = () => {
    refetchAll();
  };

  const { user } = useAuthStore();

  return (
    <div className="space-y-6 select-none">
      {/* Header & Date Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Reportes y Auditoría</h1>
            <p className="text-xs text-zinc-500 mt-1">Consulta estadísticas de transacciones, gastos operativos y logs de inventario.</p>
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

      {/* Cash Flow summary section - Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* ───── TABS NAVIGATION ───── */}
      <div className="border-b border-zinc-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('gastos')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gastos'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Gastos Operativos & Márgenes
          </button>
          <button
            onClick={() => setActiveTab('ventas')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ventas'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Ventas & Comisiones
          </button>
          <button
            onClick={() => setActiveTab('inventario')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'inventario'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <Package className="h-4 w-4" />
            Auditoría de Inventario
          </button>
        </nav>
      </div>

      {/* ───── TAB 1: GASTOS OPERATIVOS ───── */}
      {activeTab === 'gastos' && (
        <div className="space-y-6">
          {(() => {
            type GroupedRow = { label: string; key: string; costoTotal: number; ventaTotal: number; unidadesVendidas: number; margen: number; days: typeof operationalCosts };
            const grouped: GroupedRow[] = [];

            if (costViewMode === 'dia') {
              operationalCosts.forEach((d) => {
                const label = format(new Date(d.fecha), "dd MMM yyyy", { locale: es });
                grouped.push({ label, key: d.fecha, costoTotal: d.costoTotal, ventaTotal: d.ventaTotal, unidadesVendidas: d.unidadesVendidas, margen: d.ventaTotal - d.costoTotal, days: [d] });
              });
            } else if (costViewMode === 'semana') {
              const weekMap: Record<string, GroupedRow> = {};
              operationalCosts.forEach((d) => {
                const dt = new Date(d.fecha);
                const year = dt.getUTCFullYear();
                const startOfYear = new Date(Date.UTC(year, 0, 1));
                const weekNum = Math.ceil(((dt.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getUTCDay() + 1) / 7);
                const key = `${year}-S${weekNum}`;
                if (!weekMap[key]) weekMap[key] = { label: `Semana ${weekNum} — ${year}`, key, costoTotal: 0, ventaTotal: 0, unidadesVendidas: 0, margen: 0, days: [] };
                weekMap[key].costoTotal += d.costoTotal;
                weekMap[key].ventaTotal += d.ventaTotal;
                weekMap[key].unidadesVendidas += d.unidadesVendidas;
                weekMap[key].margen += (d.ventaTotal - d.costoTotal);
                weekMap[key].days.push(d);
              });
              grouped.push(...Object.values(weekMap));
            } else {
              const monthMap: Record<string, GroupedRow> = {};
              operationalCosts.forEach((d) => {
                const dt = new Date(d.fecha);
                const key = format(dt, 'yyyy-MM', { locale: es });
                const label = format(dt, 'MMMM yyyy', { locale: es });
                if (!monthMap[key]) monthMap[key] = { label: label.charAt(0).toUpperCase() + label.slice(1), key, costoTotal: 0, ventaTotal: 0, unidadesVendidas: 0, margen: 0, days: [] };
                monthMap[key].costoTotal += d.costoTotal;
                monthMap[key].ventaTotal += d.ventaTotal;
                monthMap[key].unidadesVendidas += d.unidadesVendidas;
                monthMap[key].margen += (d.ventaTotal - d.costoTotal);
                monthMap[key].days.push(d);
              });
              grouped.push(...Object.values(monthMap));
            }

            const totalCosto = operationalCosts.reduce((s, d) => s + d.costoTotal, 0);
            const totalVenta = operationalCosts.reduce((s, d) => s + d.ventaTotal, 0);
            const totalMargen = totalVenta - totalCosto;
            const margenPct = totalVenta > 0 ? ((totalMargen / totalVenta) * 100) : 0;

            const { total: cTotal, totalPages: cTp, safePg: cSafePg, start: cStart, end: cEnd, paged: cPaged, pageNums: cPageNums } = makePagination(grouped, costPg, costSize);

            return (
              <Card title="Gastos Operativos (Costo de Productos Vendidos)" subtitle="Análisis del costo de compra de los productos despachados en ventas completadas.">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase">Costo Total</p>
                    <p className="text-lg font-extrabold text-red-700 mt-0.5">${totalCosto.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase">Ingresos Brutos</p>
                    <p className="text-lg font-extrabold text-green-700 mt-0.5">${totalVenta.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase">Margen Bruto</p>
                    <p className={`text-lg font-extrabold mt-0.5 ${totalMargen >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>${totalMargen.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase">Margen %</p>
                    <p className={`text-lg font-extrabold mt-0.5 ${margenPct >= 30 ? 'text-green-700' : margenPct >= 10 ? 'text-amber-600' : 'text-red-700'}`}>{margenPct.toFixed(1)}%</p>
                  </div>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="text-xs text-zinc-500 mr-1">Agrupar por:</span>
                  {(['dia', 'semana', 'mes'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setCostViewMode(m); setCostPg(1); setExpandedDay(null); }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        costViewMode === m
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {m === 'dia' ? 'Día' : m === 'semana' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
                </div>

                {isLoadingOperationalCosts ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full animate-pulse" />
                    <Skeleton className="h-10 w-full animate-pulse" />
                    <Skeleton className="h-10 w-full animate-pulse" />
                  </div>
                ) : operationalCosts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-400">No hay ventas de productos en las fechas seleccionadas.</div>
                ) : (
                  <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                    {/* Table header with count + size selector */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
                      <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{cTotal === 0 ? 0 : cStart + 1}</span>–<span className="font-semibold text-zinc-700">{cEnd}</span> de <span className="font-semibold text-zinc-700">{cTotal}</span> {costViewMode === 'dia' ? 'días' : costViewMode === 'semana' ? 'semanas' : 'meses'}</p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span>Mostrar</span>
                        <select value={costSize} onChange={(e) => { setCostSize(Number(e.target.value)); setCostPg(1); }} className="border border-zinc-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                          <th className="px-4 py-2.5">Período</th>
                          <th className="px-4 py-2.5 text-right">Costo Total</th>
                          <th className="px-4 py-2.5 text-right">Venta Bruta</th>
                          <th className="px-4 py-2.5 text-right">Margen</th>
                          <th className="px-4 py-2.5 text-right">Margen %</th>
                          <th className="px-4 py-2.5 text-center">Unidades</th>
                          <th className="px-4 py-2.5 text-center">Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-xs">
                        {cPaged.map((row) => {
                          const pct = row.ventaTotal > 0 ? ((row.margen / row.ventaTotal) * 100) : 0;
                          const isExpanded = expandedDay === row.key;
                          const allLines = row.days.flatMap((d) => d.detalle);
                          return (
                            <React.Fragment key={row.key}>
                              <tr className={`text-zinc-650 hover:bg-zinc-50/30 ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                                <td className="px-4 py-3 font-semibold text-zinc-900">{row.label}</td>
                                <td className="px-4 py-3 text-right font-bold text-red-700">${row.costoTotal.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-medium text-green-700">${row.ventaTotal.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-right font-bold ${row.margen >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>${row.margen.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    pct >= 30 ? 'bg-green-50 text-green-700 border border-green-200'
                                    : pct >= 10 ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}>{pct.toFixed(1)}%</span>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-zinc-700">{row.unidadesVendidas}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => setExpandedDay(isExpanded ? null : row.key)}
                                    className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                                  >
                                    {isExpanded ? 'Ocultar' : `Ver ${allLines.length} líneas`}
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={7} className="px-0 py-0 bg-zinc-50/70">
                                    <div className="border-t border-indigo-100">
                                      <table className="w-full text-left text-xs">
                                        <thead>
                                          <tr className="text-[10px] font-semibold text-zinc-400 uppercase bg-zinc-100/60">
                                            <th className="px-6 py-2">Producto</th>
                                            <th className="px-4 py-2">Proveedor</th>
                                            <th className="px-4 py-2 text-right">P. Compra</th>
                                            <th className="px-4 py-2 text-right">P. Venta</th>
                                            <th className="px-4 py-2 text-center">Cant.</th>
                                            <th className="px-4 py-2 text-right">Costo</th>
                                            <th className="px-4 py-2 text-right">Venta</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                          {allLines.map((line, li) => (
                                            <tr key={li} className="hover:bg-white">
                                              <td className="px-6 py-2 font-medium text-zinc-900 truncate max-w-[180px]">{line.producto || '—'}</td>
                                              <td className="px-4 py-2 text-zinc-500 truncate max-w-[120px]">{line.proveedor || '—'}</td>
                                              <td className="px-4 py-2 text-right text-zinc-500">${line.precioCompra.toFixed(2)}</td>
                                              <td className="px-4 py-2 text-right text-zinc-500">${line.precioVenta.toFixed(2)}</td>
                                              <td className="px-4 py-2 text-center font-semibold">{line.cantidad}</td>
                                              <td className="px-4 py-2 text-right font-bold text-red-600">${line.costoLinea.toFixed(2)}</td>
                                              <td className="px-4 py-2 text-right font-bold text-green-600">${line.ventaLinea.toFixed(2)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {cTp > 1 && (
                      <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-zinc-100">
                        <button onClick={() => setCostPg((p) => Math.max(1, p - 1))} disabled={cSafePg === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                        {cPageNums().map((pg, i) => pg === '...' ? <span key={`c-${i}`} className="px-1 text-xs text-zinc-400">…</span> : <button key={pg} onClick={() => setCostPg(pg as number)} className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${cSafePg === pg ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{pg}</button>)}
                        <button onClick={() => setCostPg((p) => Math.min(cTp, p + 1))} disabled={cSafePg === cTp} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })()}
        </div>
      )}

      {/* ───── TAB 2: VENTAS Y COMISIONES ───── */}
      {activeTab === 'ventas' && (
        <div className="space-y-6">
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
              ) : (() => {
                const { total, totalPages: tp, safePg, start, end, paged, pageNums } = makePagination(salesByDate, salesPg, salesSize);
                return (
                  <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
                      <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{total === 0 ? 0 : start + 1}</span>–<span className="font-semibold text-zinc-700">{end}</span> de <span className="font-semibold text-zinc-700">{total}</span></p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span>Mostrar</span>
                        <select value={salesSize} onChange={(e) => { setSalesSize(Number(e.target.value)); setSalesPg(1); }} className="border border-zinc-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                          {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
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
                        {paged.map((sale) => (
                          <tr key={sale._id} className="text-zinc-650 hover:bg-zinc-50/30">
                            <td className="px-4 py-3 font-mono text-zinc-900">#{sale._id.slice(-6).toUpperCase()}</td>
                            <td className="px-4 py-3">{format(new Date(sale.fecha), 'dd MMM, hh:mm a', { locale: es })}</td>
                            <td className="px-4 py-3">{sale.métodoPago}</td>
                            <td className="px-4 py-3 text-right font-bold text-zinc-900">${sale.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {tp > 1 && (
                      <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-zinc-100">
                        <button onClick={() => setSalesPg((p) => Math.max(1, p - 1))} disabled={safePg === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                        {pageNums().map((pg, i) => pg === '...' ? <span key={`s-${i}`} className="px-1 text-xs text-zinc-400">…</span> : <button key={pg} onClick={() => setSalesPg(pg as number)} className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${safePg === pg ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{pg}</button>)}
                        <button onClick={() => setSalesPg((p) => Math.min(tp, p + 1))} disabled={safePg === tp} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </Card>

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                  ) : (() => {
                    const { total, totalPages: tp, safePg, start, end, paged, pageNums } = makePagination(workersList, comPg, comSize);
                    return (
                      <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
                          <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{total === 0 ? 0 : start + 1}</span>–<span className="font-semibold text-zinc-700">{end}</span> de <span className="font-semibold text-zinc-700">{total}</span></p>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <span>Mostrar</span>
                            <select value={comSize} onChange={(e) => { setComSize(Number(e.target.value)); setComPg(1); }} className="border border-zinc-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                              {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                        </div>
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                              <th className="px-4 py-2">Colaborador Secundario</th>
                              <th className="px-4 py-2 text-right">Volumen Ventas</th>
                              <th className="px-4 py-2 text-right">Comisión Asignada</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50 text-xs text-zinc-650">
                            {paged.map((worker: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-50/30">
                                <td className="px-4 py-3 font-semibold text-zinc-900">{worker.name}</td>
                                <td className="px-4 py-3 text-right text-zinc-500">${worker.totalSales.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-extrabold text-green-750">${worker.commission.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {tp > 1 && (
                          <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-zinc-100">
                            <button onClick={() => setComPg((p) => Math.max(1, p - 1))} disabled={safePg === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                            {pageNums().map((pg, i) => pg === '...' ? <span key={`c-${i}`} className="px-1 text-xs text-zinc-400">…</span> : <button key={pg} onClick={() => setComPg(pg as number)} className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${safePg === pg ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{pg}</button>)}
                            <button onClick={() => setComPg((p) => Math.min(tp, p + 1))} disabled={safePg === tp} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              );
            })()}
          </div>
        </div>
      )}

      {/* ───── TAB 3: AUDITORÍA DE INVENTARIO ───── */}
      {activeTab === 'inventario' && (
        <div className="space-y-6">
          <Card title="Auditoría de Movimientos de Inventario" subtitle="Registro de variaciones de stock de productos.">
            {isLoadingInventory ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full animate-pulse" />
                <Skeleton className="h-10 w-full animate-pulse" />
              </div>
            ) : inventoryMovements.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-450">No hay movimientos registrados en las fechas seleccionadas.</div>
            ) : (() => {
              const { total, totalPages: tp, safePg, start, end, paged, pageNums } = makePagination(inventoryMovements, invPg, invSize);
              return (
                <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
                    <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{total === 0 ? 0 : start + 1}</span>–<span className="font-semibold text-zinc-700">{end}</span> de <span className="font-semibold text-zinc-700">{total}</span></p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span>Mostrar</span>
                      <select value={invSize} onChange={(e) => { setInvSize(Number(e.target.value)); setInvPg(1); }} className="border border-zinc-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                        {[5, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                        <th className="px-4 py-2.5">Fecha</th>
                        <th className="px-4 py-2.5">Producto</th>
                        <th className="px-4 py-2.5">Tipo</th>
                        <th className="px-4 py-2.5 text-center">Variación</th>
                        <th className="px-4 py-2.5">Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-xs">
                      {paged.map((mov) => {
                        const prodName = (mov.producto && typeof mov.producto === 'object') ? mov.producto.nombre : 'Producto';
                        return (
                          <tr key={mov._id} className="text-zinc-650 hover:bg-zinc-50/30">
                            <td className="px-4 py-3">{format(new Date(mov.fecha), 'dd MMM, hh:mm a', { locale: es })}</td>
                            <td className="px-4 py-3 font-medium text-zinc-900 truncate max-w-[160px]">{prodName}</td>
                            <td className="px-4 py-3"><Badge variant={mov.tipo === 'Ingreso' ? 'success' : 'danger'}>{mov.tipo}</Badge></td>
                            <td className="px-4 py-3 text-center font-semibold text-zinc-900">{mov.tipo === 'Ingreso' ? '+' : '-'}{mov.cantidad}</td>
                            <td className="px-4 py-3 truncate max-w-[200px]" title={mov.motivo}>{mov.motivo}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {tp > 1 && (
                    <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-zinc-100">
                      <button onClick={() => setInvPg((p) => Math.max(1, p - 1))} disabled={safePg === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                      {pageNums().map((pg, i) => pg === '...' ? <span key={`iv-${i}`} className="px-1 text-xs text-zinc-400">…</span> : <button key={pg} onClick={() => setInvPg(pg as number)} className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${safePg === pg ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{pg}</button>)}
                      <button onClick={() => setInvPg((p) => Math.min(tp, p + 1))} disabled={safePg === tp} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        </div>
      )}
    </div>
  );
}
