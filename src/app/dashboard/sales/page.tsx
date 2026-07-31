'use client';

import React, { useState, useEffect } from 'react';
import { useSales } from '../../../hooks/useSales';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Input } from '../../../components/ui/Input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Eye, AlertOctagon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SalesHistoryPage() {
  const { sales, isLoading, error, refetch, annulSale, isAnnulling } = useSales();
  
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleOpenDetail = (sale: any) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  const handleAnnulSale = (id: string) => {
    Swal.fire({
      title: '¿Anular esta venta?',
      text: 'Esta acción revertirá los cambios, devolverá el stock de productos y registrará un egreso compensatorio en caja.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular venta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#f4f4f5',
      customClass: {
        confirmButton: 'text-white border-0 px-4 py-2 rounded-lg text-sm bg-red-650 hover:bg-red-700',
        cancelButton: 'text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white hover:bg-zinc-50'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await annulSale(id);
      }
    });
  };

  // Filter sales based on client search
  const filteredSales = sales.filter((sale) => {
    const clientName = (sale.cliente && typeof sale.cliente === 'object')
      ? `${sale.cliente.nombres} ${sale.cliente.apellidos}`.toLowerCase()
      : '';
    return clientName.includes(search.toLowerCase()) || sale._id.toLowerCase().includes(search.toLowerCase());
  });

  const totalRecords = filteredSales.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Historial de Ventas</h1>
        <p className="text-xs text-zinc-500 mt-1">Revisa el listado de facturaciones y gestiona anulaciones.</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o ID de venta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 placeholder-zinc-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 shrink-0">
            <span>Mostrar</span>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
              {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>por página</span>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full animate-pulse" />
          <Skeleton className="h-12 w-full animate-pulse" />
          <Skeleton className="h-12 w-full animate-pulse" />
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : filteredSales.length === 0 ? (
        <EmptyState title="No se encontraron ventas" description="Intente cambiar la búsqueda o registre una nueva venta." />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-3">ID Factura</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Fecha / Hora</th>
                  <th className="px-6 py-3">Método Pago</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedSales.map((sale) => {
                  const clientName = (sale.cliente && typeof sale.cliente === 'object')
                    ? `${sale.cliente.nombres} ${sale.cliente.apellidos}`
                    : 'Cliente General';
                  return (
                    <tr key={sale._id} className="text-zinc-650 hover:bg-zinc-50/30">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-900">#{sale._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900 truncate max-w-[150px]">{clientName}</td>
                      <td className="px-6 py-4 text-xs">
                        {format(new Date(sale.fecha), "dd LLL yyyy, hh:mm a", { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-xs">{sale.métodoPago}</td>
                      <td className="px-6 py-4">
                        <Badge variant={sale.estado === 'Completada' ? 'success' : 'danger'}>
                          {sale.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-zinc-900">${sale.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="p-1.5 cursor-pointer" onClick={() => handleOpenDetail(sale)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {sale.estado === 'Completada' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 text-red-650 cursor-pointer"
                            onClick={() => handleAnnulSale(sale._id)}
                            disabled={isAnnulling}
                          >
                            <AlertOctagon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
            <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{totalRecords === 0 ? 0 : startIndex + 1}</span>–<span className="font-semibold text-zinc-700">{endIndex}</span> de <span className="font-semibold text-zinc-700">{totalRecords}</span> registros</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Página anterior"><ChevronLeft className="h-4 w-4" /></button>
              {getPageNumbers().map((page, idx) => page === '...' ? <span key={`e-${idx}`} className="px-2 text-xs text-zinc-400">…</span> : <button key={page} onClick={() => setCurrentPage(page as number)} className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${safePage === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100'}`}>{page}</button>)}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Página siguiente"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Detalles de Venta"
        footer={
          <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {selectedSale && (
          <div className="space-y-5 text-xs text-zinc-650 select-none">
            <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-zinc-50/50">
              <div>
                <p className="text-[10px] text-zinc-440 uppercase font-semibold">Cliente</p>
                <p className="text-zinc-900 font-bold mt-0.5">
                  {(selectedSale.cliente && typeof selectedSale.cliente === 'object')
                    ? `${selectedSale.cliente.nombres} ${selectedSale.cliente.apellidos}`
                    : 'Cliente General'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-440 uppercase font-semibold">Cajero / Usuario</p>
                <p className="text-zinc-900 font-bold mt-0.5">
                  {(selectedSale.usuario && typeof selectedSale.usuario === 'object')
                    ? `${selectedSale.usuario.nombres} ${selectedSale.usuario.apellidos}`
                    : 'Cajero General'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Fecha</p>
                <p className="text-zinc-900 font-bold mt-0.5">
                  {format(new Date(selectedSale.fecha), "dd 'de' MMMM yyyy, hh:mm a", { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-semibold">Forma de Pago</p>
                <p className="text-zinc-900 font-bold mt-0.5">
                  {selectedSale.métodoPago}
                  {selectedSale.referenciaTransferencia && ` (Ref: ${selectedSale.referenciaTransferencia})`}
                </p>
              </div>
            </div>

            {selectedSale.comprobanteUrl && (
              <div className="p-3 border border-zinc-200 rounded-lg bg-zinc-50/50 flex items-center justify-between">
                <span className="font-semibold text-zinc-800">Comprobante de Transferencia:</span>
                <a
                  href={selectedSale.comprobanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-1"
                >
                  Ver Recibo de Pago ↗
                </a>
              </div>
            )}

            <div>
              <p className="font-semibold text-zinc-900 mb-2">Artículos Vendidos</p>
              <div className="border rounded-lg overflow-hidden divide-y divide-zinc-100 bg-white">
                {selectedSale.detalles.map((item: any, idx: number) => {
                  const title = item.tipo === 'Producto' && item.producto
                    ? item.producto.nombre
                    : item.servicio
                    ? item.servicio.nombre
                    : 'Ítem no cargado';
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-zinc-50/50">
                      <div>
                        <p className="font-semibold text-zinc-800">{title}</p>
                        <p className="text-[10px] text-zinc-450 mt-0.5">
                          {item.tipo} • {item.cantidad} x ${item.precio.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-zinc-900">${item.subtotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedSale.observaciones && (
              <div>
                <p className="text-[10px] text-zinc-450 uppercase font-semibold">Observaciones</p>
                <p className="p-2 border rounded-lg bg-zinc-50 text-zinc-700 italic mt-0.5">
                  "{selectedSale.observaciones}"
                </p>
              </div>
            )}

            <div className="flex flex-col items-end gap-1.5 pt-3 border-t border-zinc-100">
              <div className="flex gap-4">
                <span className="text-zinc-500">Subtotal:</span>
                <span className="text-zinc-900 font-medium">${selectedSale.subtotal.toFixed(2)}</span>
              </div>
              {selectedSale.descuento > 0 && (
                <div className="flex gap-4 text-red-650">
                  <span>Descuento:</span>
                  <span>-${selectedSale.descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex gap-4">
                <span className="text-zinc-500">IVA ({process.env.NEXT_PUBLIC_TAX_VALOR || '15'}%):</span>
                <span className="text-zinc-900 font-medium">${selectedSale.iva.toFixed(2)}</span>
              </div>
              <div className="flex gap-4 text-sm font-bold text-zinc-950 mt-1">
                <span>Total Cobrado:</span>
                <span>${selectedSale.total.toFixed(2)}</span>
              </div>
              {(selectedSale.gananciaPrincipal !== undefined || selectedSale.gananciaSecundario !== undefined) && (
                <div className="w-full mt-2 pt-2 border-t border-dashed border-zinc-200 text-[10px] text-zinc-400 flex flex-col items-end gap-1 select-none">
                  <div className="flex gap-4">
                    <span>Comisión Principal (Luis):</span>
                    <span className="font-bold text-zinc-700">${(selectedSale.gananciaPrincipal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Comisión Secundario (Colaborador):</span>
                    <span className="font-bold text-green-700">${(selectedSale.gananciaSecundario || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
