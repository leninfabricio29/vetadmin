'use client';

import React, { useState } from 'react';
import { useSalesStore } from '@/src/store/sales.store';
import { useRegisterStore } from '@/src/store/register.store';
import { apiClient } from '@/src/lib/axios';
import { useClients } from '@/src/hooks/useClients';
import { useProducts } from '@/src/hooks/useProducts';
import { useSales } from '@/src/hooks/useSales';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Modal } from '@/src/components/ui/Modal';
import { Select } from '@/src/components/ui/Select';
import { TextArea } from '@/src/components/ui/TextArea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '@/src/validators';
import {
  Search,
  Plus,
  Trash2,
  Minus,
  CheckCircle,
  FileText,
  UserPlus,
  ShoppingBag,
  HeartPulse,
  Printer
} from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/src/store/auth.store';

type ClientFormInputs = z.infer<typeof clientSchema>;

// How many matches to show in the inline client search dropdown before
// telling the user to keep typing instead of dumping the whole list.
const MAX_CLIENT_RESULTS = 5;

export default function POSPage() {
  const isCajaOpen = useRegisterStore((state) => state.isOpen);
  const activeRegister = useRegisterStore((state) => state.activeRegister);
  const { user } = useAuthStore();

  // Zustand POS Cart state
  const {
    items,
    client,
    discount,
    paymentMethod,
    notes,
    addItem,
    removeItem,
    updateQuantity,
    setClient,
    setDiscount,
    setPaymentMethod,
    setNotes,
    getTotals
  } = useSalesStore();

  const { createSale, isCreating } = useSales();
  const { clients, createClient, isLoading: loadingClients } = useClients();
  const { products } = useProducts();

  const [pagaCon, setPagaCon] = useState<number | ''>('');
  const [referencia, setReferencia] = useState('');
  const [uploadedComprobanteUrl, setUploadedComprobanteUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('comprobante', file);

    try {
      const response = await apiClient.post('/sales/upload-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadedComprobanteUrl(response.data.data.url);
      toast.success('Comprobante subido exitosamente.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al subir comprobante.');
      e.target.value = '';
    } finally {
      setIsUploadingFile(false);
    }
  };

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [createdSale, setCreatedSale] = useState<any>(null);

  // Search parameters
  const [itemSearch, setItemSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const {
    register: registerClient,
    handleSubmit: handleClientSubmit,
    reset: resetClientForm,
    formState: { errors: clientErrors },
  } = useForm<ClientFormInputs>({
    resolver: zodResolver(clientSchema) as any,
  });

  const { subtotal, discount: appliedDiscount, iva, total } = getTotals();

  // Create client inline
  const handleQuickCreateClient = async (data: ClientFormInputs) => {
    try {
      const newClient = await createClient(data);
      setClient(newClient);
      setIsClientModalOpen(false);
      resetClientForm();
    } catch (e) {}
  };

  // Confirm and submit sale
  const handleCheckout = async () => {
    if (!client) {
      toast.error('Debe seleccionar un cliente para la venta.');
      return;
    }
    if (items.length === 0) {
      toast.error('El carrito de compras está vacío.');
      return;
    }

    if (paymentMethod === 'Transferencia') {
      if (!uploadedComprobanteUrl) {
        toast.error('Debe cargar la imagen del comprobante para cobros con transferencia.');
        return;
      }
      if (!referencia.trim()) {
        toast.error('Debe ingresar el código de referencia de la transferencia.');
        return;
      }
    }

    Swal.fire({
      title: '¿Confirmar cobro?',
      html: `
        <div class="text-left text-xs space-y-1 p-3 border rounded-lg bg-zinc-50 font-sans">
          <div><b>Cliente:</b> ${client.nombres} ${client.apellidos}</div>
          <div><b>Método de Pago:</b> ${paymentMethod}</div>
          ${paymentMethod === 'Transferencia' ? `<div><b>Referencia:</b> ${referencia}</div>` : ''}
          <div class="h-px bg-zinc-200 my-1"></div>
          <div class="flex justify-between font-bold text-sm text-zinc-900">
            <span>Total a Cobrar:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cobrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#18181b',
      cancelButtonColor: '#f4f4f5',
      customClass: {
        confirmButton: 'text-white border-0 px-4 py-2 rounded-lg text-sm bg-zinc-900 hover:bg-zinc-800',
        cancelButton: 'text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white hover:bg-zinc-50'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = {
            cliente: client._id,
            métodoPago: paymentMethod,
            descuento: discount,
            observaciones: notes,
            comprobanteUrl: paymentMethod === 'Transferencia' ? uploadedComprobanteUrl : undefined,
            referenciaTransferencia: paymentMethod === 'Transferencia' ? referencia : undefined,
            detalles: items.map((i) => ({
              tipo: i.tipo,
              producto: i.tipo === 'Producto' ? i.id : undefined,
              servicio: i.tipo === 'Servicio' ? i.id : undefined,
              cantidad: i.cantidad,
            })),
          };

          const res = await createSale(payload);
          setCreatedSale(res);
          setIsReceiptModalOpen(true);
          setPagaCon('');
          setReferencia('');
          setUploadedComprobanteUrl('');
        } catch (e) {}
      }
    });
  };

  // Filter items
  const filteredProducts = products.filter(
    (p) =>
      p.estado === 'Activo' &&
      (p.nombre.toLowerCase().includes(itemSearch.toLowerCase()) ||
        p.código.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  const MAX_PRODUCT_RESULTS = 6; // 2 rows of 3 columns
  const visibleProducts = filteredProducts.slice(0, MAX_PRODUCT_RESULTS);
  const hiddenProductsCount = filteredProducts.length - visibleProducts.length;

  // Filter clients (full match set, used to know how many results exist)
  const filteredClients = clients.filter(
    (c) =>
      c.estado === 'Activo' &&
      (c.nombres.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.apellidos.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.cédula.includes(clientSearch))
  );

  // Only render a handful of matches in the dropdown; the rest are
  // summarized instead of rendered so the list never dumps the whole table.
  const visibleClients = filteredClients.slice(0, MAX_CLIENT_RESULTS);
  const hiddenClientsCount = filteredClients.length - visibleClients.length;

  // Lock interface if daily turn register is closed
  if (!isCajaOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center select-none">
        <Card className="max-w-md p-8 border-dashed border border-zinc-200">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-bold text-zinc-950">Terminal POS Bloqueada</h2>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            No es posible registrar ventas en este momento porque no hay un turno de caja abierto.
            Por favor, dirígete al módulo de caja diaria y abre un turno.
          </p>
          <Link href="/dashboard/cash">
            <Button className="mt-5 cursor-pointer font-semibold">Ir a Caja Diaria</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none h-[calc(100vh-8rem)] grid-rows-[minmax(0,1fr)]">
      <style dangerouslySetInnerHTML={{ __html: 'main { overflow: hidden !important; }' }} />
      {/* Left panel: Cart details & search catalog (2/3 width) */}
      <div className="lg:col-span-2 flex flex-col gap-5 overflow-hidden min-h-0">
        {/* Search catalog bar */}
        <Card className="shrink-0 p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="w-full relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar producto por código o nombre..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 placeholder-zinc-400"
              />
            </div>
          </div>
        </Card>

        {/* Scrollable products item grid */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visibleProducts.map((p) => (
              <div
                key={p._id}
                onClick={() =>
                  addItem({
                    tipo: 'Producto',
                    id: p._id,
                    nombre: p.nombre,
                    precio: p.precioVenta,
                    stockMax: p.stock,
                    código: p.código,
                    tieneIva: p.tieneIva,
                    comisiónPrincipal: p.comisiónPrincipal !== undefined ? p.comisiónPrincipal : 100,
                    comisiónSecundario: p.comisiónSecundario !== undefined ? p.comisiónSecundario : 0,
                  })
                }
                className="p-3 border border-zinc-200 bg-white hover:border-zinc-800 rounded-lg cursor-pointer transition-all flex flex-col justify-between text-xs group active:scale-[0.98]"
              >
                <div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-650">{p.código}</span>
                    <Badge variant={p.stock === 0 ? 'danger' : p.stock <= p.stockMínimo ? 'warning' : 'success'} className="px-1.5 py-0">
                      {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                    </Badge>
                  </div>
                  <p className="font-semibold text-zinc-900 mt-1.5 truncate leading-tight group-hover:text-zinc-950">{p.nombre}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-50">
                  <span className="text-zinc-500">Precio:</span>
                  <span className="font-bold text-zinc-900">${p.precioVenta.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          {hiddenProductsCount > 0 && (
            <div className="text-center py-1.5 px-3 bg-zinc-100/70 border border-zinc-200/80 rounded-lg text-xs font-semibold text-zinc-600 flex items-center justify-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] font-bold">
                +{hiddenProductsCount}
              </span>
              <span>productos más. Usa el buscador para afinar la búsqueda.</span>
            </div>
          )}
        </div>

        {/* Selected Cart Items Table */}
        <Card className="flex-1 flex flex-col overflow-hidden min-h-0" bodyClassName="flex-1 flex flex-col overflow-hidden min-h-0 p-4" title="Resumen del Pedido">
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400">
                <ShoppingBag className="h-8 w-8 mb-2" />
                <span className="text-xs">No hay artículos cargados en el pedido.</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-zinc-500 font-semibold border-b border-zinc-100 pb-2">
                    <th className="pb-2 bg-white">Ítem</th>
                    <th className="pb-2 text-center bg-white">Cantidad</th>
                    <th className="pb-2 text-right bg-white">Precio</th>
                    <th className="pb-2 text-right bg-white">Subtotal</th>
                    <th className="pb-2 text-right bg-white"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {items.map((i) => (
                    <tr key={`${i.tipo}-${i.id}`} className="text-zinc-650">
                      <td className="py-2.5">
                        <p className="font-semibold text-zinc-900 truncate max-w-[180px]">{i.nombre}</p>
                        <div className="text-[10px] text-zinc-450 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>{i.tipo} {i.código && `• ${i.código}`}</span>

                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(i.id, i.tipo, i.cantidad - 1)}
                            className="p-1 border rounded bg-zinc-50 text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-zinc-900 w-4 text-center">{i.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(i.id, i.tipo, i.cantidad + 1)}
                            className="p-1 border rounded bg-zinc-50 text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-medium text-zinc-900">${i.precio.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-zinc-950">${(i.precio * i.cantidad).toFixed(2)}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => removeItem(i.id, i.tipo)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Right panel: customer profile & checkout values (1/3 width) */}
      {/*
        Restructured as its own flex column with two zones:
          1) a scrollable zone (client card + payment details) that can grow
             as much as it needs (transfer proof preview, notes, etc.)
          2) a fixed footer (totals + "Completar y Cobrar") that never moves
             and is always reachable without hunting for it.
        `grid-rows-[minmax(0,1fr)]` on the parent grid is what lets this
        column actually shrink to the available height instead of growing
        past the viewport (the previous "h-full" had nothing to be a
        percentage of, since an implicit grid row sizes to its content).
      */}
      <div className="flex flex-col h-full min-h-0 gap-4">
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-5">
          {/* Customer Select Card */}
          <Card title="Cliente Facturación" className="shrink-0">
            {client ? (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50/50">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{client.nombres} {client.apellidos}</p>
                  <p className="text-[10px] text-zinc-450 mt-0.5 font-mono">DNI: {client.cédula} • {client.teléfono}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-xs text-red-650 cursor-pointer" onClick={() => setClient(null)}>
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Buscar por cédula o nombre..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="flex items-center gap-1 shrink-0 cursor-pointer" onClick={() => setIsClientModalOpen(true)}>
                    <UserPlus className="h-3.5 w-3.5" /> Nuevo
                  </Button>
                </div>

                {clientSearch && (
                  <div className="border rounded-lg max-h-[220px] overflow-y-auto bg-white divide-y divide-zinc-50 text-xs">
                    {visibleClients.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          setClient({
                            _id: c._id,
                            nombres: c.nombres,
                            apellidos: c.apellidos,
                            cédula: c.cédula,
                            teléfono: c.teléfono,
                            email: c.email,
                          });
                          setClientSearch('');
                        }}
                        className="p-2 hover:bg-zinc-50 cursor-pointer"
                      >
                        <p className="font-semibold text-zinc-800">{c.nombres} {c.apellidos}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">DNI: {c.cédula} • {c.teléfono}</p>
                      </div>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="p-3 text-center text-zinc-400">Cliente no encontrado.</div>
                    )}
                    {hiddenClientsCount > 0 && (
                      <div className="p-2 text-center text-zinc-400 bg-zinc-50/70 sticky bottom-0">
                        +{hiddenClientsCount} {hiddenClientsCount === 1 ? 'resultado más' : 'resultados más'}, sigue escribiendo para acotar
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Check calculations summary Card */}
          <Card title="Detalles del Pago" className="shrink-0">
            <div className="space-y-4">
              {/* Pay type select */}
              <Select
                label="Método de Pago"
                options={[
                  { label: 'Efectivo', value: 'Efectivo' },
                  { label: 'Tarjeta de Débito/Crédito', value: 'Tarjeta' },
                  { label: 'Transferencia Bancaria', value: 'Transferencia' },
                ]}
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
              />

              {/* Discount input */}
              <Input
                label="Descuento Directo ($)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />

              {/* Efectivo cash change calculator */}
              {paymentMethod === 'Efectivo' && (
                <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-zinc-50/30">
                  <Input
                    label="Paga con ($)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={pagaCon || ''}
                    onChange={(e) => setPagaCon(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  />
                  <div className="flex flex-col justify-end pb-1.5">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Vuelto</span>
                    <span className={`text-base font-extrabold ${pagaCon !== '' && pagaCon >= total ? 'text-green-700' : 'text-zinc-400'}`}>
                      ${pagaCon !== '' && pagaCon >= total ? (pagaCon - total).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              )}

              {/* Transfer Reference & Cloudinary Upload */}
              {paymentMethod === 'Transferencia' && (
                <div className="space-y-3 p-3 border rounded-lg bg-zinc-50/50">
                  <Input
                    label="Código de Referencia"
                    type="text"
                    placeholder="Ej. TX-9842"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">Cargar Comprobante</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-150 file:text-zinc-750 file:cursor-pointer hover:file:bg-zinc-200"
                    />
                    {isUploadingFile && (
                      <span className="text-[10px] text-zinc-500 animate-pulse font-medium">Subiendo comprobante...</span>
                    )}
                    {!isUploadingFile && uploadedComprobanteUrl && (
                      <div className="mt-2 space-y-1.5">
                        <span className="text-[10px] text-green-700 font-semibold">✓ Comprobante cargado correctamente</span>
                        <div className="relative border border-zinc-200 rounded-lg overflow-hidden h-24 w-full bg-zinc-100 flex items-center justify-center">
                          <img
                            src={uploadedComprobanteUrl}
                            alt="Previsualización de Comprobante"
                            className="object-contain h-full w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <TextArea
                label="Observaciones (Opcional)"
                placeholder="Notas de facturación..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Fixed footer: totals + checkout button, always visible regardless
            of how tall the scrollable content above gets. */}
        <Card className="shrink-0">
          <div className="space-y-4">
            <div className="p-3 border rounded-lg bg-zinc-50 text-xs space-y-1.5 font-medium select-none">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal:</span>
                <span className="text-zinc-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-650">
                <span>Descuento:</span>
                <span>-${appliedDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">IVA ({process.env.NEXT_PUBLIC_TAX_VALOR || '15'}%):</span>
                <span className="text-zinc-900">${iva.toFixed(2)}</span>
              </div>
              <div className="h-px bg-zinc-200 my-1"></div>
              <div className="flex justify-between text-sm font-bold text-zinc-950">
                <span>Total a Pagar:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              isLoading={isCreating}
              className="w-full cursor-pointer font-bold py-2.5"
            >
              Completar y Cobrar
            </Button>
          </div>
        </Card>
      </div>

      {/* Inline Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Creación Rápida de Cliente"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsClientModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleClientSubmit(handleQuickCreateClient)} className="font-semibold cursor-pointer">Registrar Cliente</Button>
          </>
        }
      >
        <form onSubmit={handleClientSubmit(handleQuickCreateClient)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombres" type="text" error={clientErrors.nombres?.message} {...registerClient('nombres')} />
            <Input label="Apellidos" type="text" error={clientErrors.apellidos?.message} {...registerClient('apellidos')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cédula/DNI" type="text" error={clientErrors.cédula?.message} {...registerClient('cédula')} />
            <Input label="Teléfono" type="text" error={clientErrors.teléfono?.message} {...registerClient('teléfono')} />
          </div>
          <Input label="Email" type="email" error={clientErrors.email?.message} {...registerClient('email')} />
          <Input label="Dirección" type="text" error={clientErrors.dirección?.message} {...registerClient('dirección')} />
        </form>
      </Modal>

      {/* Voucher modal popup */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Comprobante de Venta"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>Cerrar</Button>
            <Button
              className="flex items-center gap-1.5 cursor-pointer font-semibold"
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="h-4 w-4" /> Imprimir Comprobante
            </Button>
          </>
        }
      >
        {createdSale && (
          <div className="p-4 border rounded-lg bg-white font-mono text-xs text-zinc-700 space-y-4 max-w-sm mx-auto shadow-xs border-zinc-200">
            {/* Header info */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-zinc-250">
              <h3 className="font-bold text-zinc-950 text-sm">
                {user?.veterinaria?.nombre ? user.veterinaria.nombre.toUpperCase() : 'CLÍNICA VETERINARIA VETGESTION'}
              </h3>
              <p className="text-[10px] text-zinc-400">
                RUC: {user?.veterinaria?.RUC || '1792949581001'}
              </p>
              {(user?.veterinaria?.teléfono || user?.veterinaria?.dirección) ? (
                <p className="text-[10px] text-zinc-400">
                  {user.veterinaria.teléfono ? `Tel: ${user.veterinaria.teléfono}` : ''}
                  {user.veterinaria.teléfono && user.veterinaria.dirección ? ' • ' : ''}
                  {user.veterinaria.dirección || ''}
                </p>
              ) : (
                <p className="text-[10px] text-zinc-400">Tel: 02-3949823 • Quito, Ecuador</p>
              )}
              <div className="h-2"></div>
              <p className="font-bold text-zinc-900 uppercase">Factura simplificada</p>
              <p className="text-[10px] text-zinc-450 font-bold">Venta ID: #{createdSale._id}</p>
            </div>

            {/* Body metadata */}
            <div className="space-y-1 pb-3 border-b border-dashed border-zinc-250">
              <div><b>Cliente:</b> {createdSale.cliente?.nombres} {createdSale.cliente?.apellidos}</div>
              <div><b>Cédula:</b> {createdSale.cliente?.cédula}</div>
              <div><b>Fecha:</b> {format(new Date(createdSale.fecha), 'yyyy-MM-dd HH:mm')}</div>
              <div><b>Método Pago:</b> {createdSale.métodoPago}</div>
              {createdSale.referenciaTransferencia && (
                <div><b>Referencia:</b> {createdSale.referenciaTransferencia}</div>
              )}
            </div>

            {/* Cart Row detail lists */}
            <div className="space-y-1.5 py-1 border-b border-dashed border-zinc-250">
              <div className="flex justify-between font-bold text-zinc-900 border-b border-zinc-100 pb-1">
                <span>Descripción</span>
                <span className="w-10 text-center">Cant.</span>
                <span>Precio</span>
              </div>
              {createdSale.detalles.map((i: any) => {
                const prodName = typeof i.producto === 'object' && i.producto ? i.producto.nombre : 'Producto';
                return (
                  <div key={i._id || i.producto?._id || i.producto} className="flex justify-between">
                    <span className="truncate max-w-[150px]">{prodName}</span>
                    <span className="w-10 text-center">{i.cantidad}</span>
                    <span>${(i.precio * i.cantidad).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Maths footer */}
            <div className="space-y-1 text-right select-none">
              <div>Subtotal: ${createdSale.subtotal.toFixed(2)}</div>
              {createdSale.descuento > 0 && <div className="text-red-650">Descuento: -${createdSale.descuento.toFixed(2)}</div>}
              <div>IVA ({process.env.NEXT_PUBLIC_TAX_VALOR || '15'}%): ${createdSale.iva.toFixed(2)}</div>
              <div className="text-sm font-bold text-zinc-950 mt-1 border-t border-zinc-200 pt-1">
                Total Facturado: ${createdSale.total.toFixed(2)}
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-450 pt-3 border-t border-dashed border-zinc-250">
              ¡Gracias por confiar la salud de tu mascota en nosotros!
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}