'use client';

import React, { useState, useEffect } from 'react';
import { useCashRegister } from '@/src/hooks/useCashRegister';
import { useRegisterStore } from '@/src/store/register.store';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { TextArea } from '@/src/components/ui/TextArea';
import { Modal } from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/Badge';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { openRegisterSchema, closeRegisterSchema, manualMovementSchema } from '@/src/validators';
import { Plus, Power, HelpCircle, ArrowUpRight, ArrowDownRight, Wallet, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';
import { z } from 'zod';

type OpenRegisterInputs = z.infer<typeof openRegisterSchema>;
type CloseRegisterInputs = z.infer<typeof closeRegisterSchema>;
type ManualMovementInputs = z.infer<typeof manualMovementSchema>;

export default function CashRegisterPage() {
  const activeRegister = useRegisterStore((state) => state.activeRegister);
  const {
    isOpen,
    isLoadingActive,
    registers,
    isLoadingRegisters,
    movements,
    isLoadingMovements,
    openRegister,
    isOpening,
    closeRegister,
    isClosing,
    addMovement,
    isAddingMovement
  } = useCashRegister(activeRegister?._id);

  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // Pagination for movements table
  const [movPage, setMovPage] = useState(1);
  const [movPageSize, setMovPageSize] = useState(10);
  // Pagination for registers history table
  const [regPage, setRegPage] = useState(1);
  const [regPageSize, setRegPageSize] = useState(10);

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

  const openForm = useForm<OpenRegisterInputs>({ resolver: zodResolver(openRegisterSchema) as any });
  const closeForm = useForm<CloseRegisterInputs>({ resolver: zodResolver(closeRegisterSchema) as any });
  const movementForm = useForm<ManualMovementInputs>({ resolver: zodResolver(manualMovementSchema) as any });

  const handleOpenTurn = async (data: OpenRegisterInputs) => {
    try {
      await openRegister(data.montoInicial);
      setIsOpeningModalOpen(false);
      openForm.reset();
    } catch (e) {}
  };

  const handleCloseTurn = async (data: CloseRegisterInputs) => {
    try {
      const expected = activeRegister?.efectivoEsperado || 0;
      const discrepancy = data.efectivoContado - expected;

      Swal.fire({
        title: '¿Confirmar cierre de caja?',
        html: `
          <div class="text-left text-xs space-y-1.5 p-3 border rounded-lg bg-zinc-50 font-sans">
            <div><b>Efectivo esperado:</b> $${expected.toFixed(2)}</div>
            <div><b>Efectivo contado:</b> $${data.efectivoContado.toFixed(2)}</div>
            <div class="${discrepancy >= 0 ? 'text-green-700' : 'text-red-700'}"><b>Diferencia:</b> $${discrepancy.toFixed(2)}</div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar caja',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#18181b',
        cancelButtonColor: '#f4f4f5',
        customClass: {
          confirmButton: 'text-white border-0 px-4 py-2 rounded-lg text-sm bg-zinc-900 hover:bg-zinc-800',
          cancelButton: 'text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white hover:bg-zinc-50'
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          await closeRegister(data.efectivoContado);
          setIsClosingModalOpen(false);
          closeForm.reset();
        }
      });
    } catch (e) {}
  };

  const handleCreateMovement = async (data: ManualMovementInputs) => {
    try {
      await addMovement(data);
      setIsMovementModalOpen(false);
      movementForm.reset();
    } catch (e) {}
  };

  return (
    <div className="space-y-8 select-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Caja Diaria</h1>
          <p className="text-xs text-zinc-500 mt-1">Monitorea y cuadra los flujos de dinero en efectivo de la clínica.</p>
        </div>
        {isOpen && activeRegister ? (
          <Button
            variant="danger"
            onClick={() => setIsClosingModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer font-semibold sm:self-end"
          >
            <Power className="h-4 w-4" /> Cerrar Turno de Caja
          </Button>
        ) : (
          <Button
            onClick={() => setIsOpeningModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer font-semibold sm:self-end"
          >
            <Plus className="h-4 w-4" /> Aperturar Caja
          </Button>
        )}
      </div>

      {isLoadingActive ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full animate-pulse" />
        </div>
      ) : isOpen && activeRegister ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              <b>Control de Arqueo Físico:</b> La caja diaria contabiliza <b>exclusivamente el dinero en efectivo</b>. Las ventas cobradas con <b>Tarjeta</b> o <b>Transferencia</b> van directamente a las cuentas bancarias de la clínica y no afectan el dinero físico del cajón.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Monto Inicial (Efectivo)</p>
              <p className="text-lg font-bold text-zinc-900 mt-1">${activeRegister.montoInicial.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Ventas en Efectivo</p>
              <p className="text-lg font-bold text-zinc-900 mt-1 text-green-700">+${activeRegister.ventas.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Ingresos Manuales</p>
              <p className="text-lg font-bold text-zinc-900 mt-1 text-green-600">+${activeRegister.ingresos.toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Egresos Manuales</p>
              <p className="text-lg font-bold text-zinc-900 mt-1 text-red-600">-${activeRegister.egresos.toFixed(2)}</p>
            </Card>
            <Card className="bg-zinc-900 border-zinc-950 text-white">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase">Efectivo Esperado en Caja</p>
              <p className="text-lg font-bold mt-1">${activeRegister.efectivoEsperado.toFixed(2)}</p>
            </Card>
          </div>

          <Card title="Movimientos de Efectivo (Turno Activo)" subtitle="Detalle de ingresos y egresos registrados durante el turno.">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-zinc-500">
                Apertura: {format(new Date(activeRegister.fechaApertura), "d 'de' MMMM, h:mm a", { locale: es })}
                {typeof activeRegister.usuario === 'object' && activeRegister.usuario !== null && (
                  <span className="ml-2 font-semibold text-zinc-700">· Abierta por: {activeRegister.usuario.nombres} {activeRegister.usuario.apellidos}</span>
                )}
              </span>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setIsMovementModalOpen(true)}>
                Registrar Movimiento Manual
              </Button>
            </div>

            {isLoadingMovements ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-450">No hay movimientos manuales registrados en este turno.</div>
            ) : (() => {
              const { total, totalPages: tp, safePg, start, end, paged, pageNums } = makePagination(movements, movPage, movPageSize);
              return (
                <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                  <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
                    <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{total === 0 ? 0 : start + 1}</span>–<span className="font-semibold text-zinc-700">{end}</span> de <span className="font-semibold text-zinc-700">{total}</span></p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span>Mostrar</span>
                      <select value={movPageSize} onChange={(e) => { setMovPageSize(Number(e.target.value)); setMovPage(1); }} className="border border-zinc-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                        {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                        <th className="px-4 py-2.5">Tipo</th>
                        <th className="px-4 py-2.5">Concepto</th>
                        <th className="px-4 py-2.5">Descripción</th>
                        <th className="px-4 py-2.5">Fecha / Hora</th>
                        <th className="px-4 py-2.5 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {paged.map((mov) => (
                        <tr key={mov._id} className="text-zinc-650 hover:bg-zinc-50/30">
                          <td className="px-4 py-3 font-semibold text-xs">
                            {mov.tipo === 'Ingreso' ? (
                              <span className="text-green-700 inline-flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" /> Ingreso</span>
                            ) : (
                              <span className="text-red-700 inline-flex items-center gap-1"><ArrowDownRight className="h-3.5 w-3.5" /> Egreso</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-900 font-medium">{mov.concepto}</td>
                          <td className="px-4 py-3 text-xs">{mov.descripción || 'N/A'}</td>
                          <td className="px-4 py-3 text-xs">{format(new Date(mov.createdAt || ''), 'h:mm a', { locale: es })}</td>
                          <td className={`px-4 py-3 text-right font-bold ${mov.tipo === 'Ingreso' ? 'text-green-700' : 'text-red-700'}`}>
                            {mov.tipo === 'Ingreso' ? '+' : '-'}${mov.monto.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tp > 1 && (
                    <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-zinc-100">
                      <button onClick={() => setMovPage((p) => Math.max(1, p - 1))} disabled={safePg === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                      {pageNums().map((pg, i) => pg === '...' ? <span key={`m-${i}`} className="px-1 text-xs text-zinc-400">…</span> : <button key={pg} onClick={() => setMovPage(pg as number)} className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${safePg === pg ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{pg}</button>)}
                      <button onClick={() => setMovPage((p) => Math.min(tp, p + 1))} disabled={safePg === tp} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-zinc-50/30 border-dashed border border-zinc-200 rounded-xl">
          <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 mb-4">
            <Wallet className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900">La caja diaria se encuentra cerrada</h2>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4 leading-relaxed">
            Debes abrir un turno de caja especificando un monto en efectivo inicial antes de procesar ventas o registrar movimientos de dinero.
          </p>
          <Button onClick={() => setIsOpeningModalOpen(true)} className="cursor-pointer font-semibold">
            Abrir Caja Diaria
          </Button>
        </Card>
      )}

      {/* Turn Closure History */}
      <Card title="Historial de Turnos de Caja" subtitle="Resumen de cierres de caja históricos.">
        {isLoadingRegisters ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full animate-pulse" />
            <Skeleton className="h-10 w-full animate-pulse" />
          </div>
        ) : registers.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-450">No hay cierres registrados.</div>
        ) : (() => {
          const { total: rTotal, totalPages: rTp, safePg: rSafePg, start: rStart, end: rEnd, paged: rPaged, pageNums: rPageNums } = makePagination(registers, regPage, regPageSize);
          return (
            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 bg-zinc-50/50">
                <p className="text-xs text-zinc-500">Mostrando <span className="font-semibold text-zinc-700">{rTotal === 0 ? 0 : rStart + 1}</span>–<span className="font-semibold text-zinc-700">{rEnd}</span> de <span className="font-semibold text-zinc-700">{rTotal}</span> turnos</p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Mostrar</span>
                  <select value={regPageSize} onChange={(e) => { setRegPageSize(Number(e.target.value)); setRegPage(1); }} className="border border-zinc-200 rounded-md px-1.5 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                    {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-150 bg-zinc-50/50">
                    <th className="px-4 py-2.5">Apertura</th>
                    <th className="px-4 py-2.5">Cierre</th>
                    <th className="px-4 py-2.5">Monto Inicial</th>
                    <th className="px-4 py-2.5">Esperado</th>
                    <th className="px-4 py-2.5">Declarado</th>
                    <th className="px-4 py-2.5">Diferencia</th>
                    <th className="px-4 py-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {rPaged.map((reg) => (
                    <tr key={reg._id} className="text-zinc-650 hover:bg-zinc-50/30">
                      <td className="px-4 py-3 text-xs">{format(new Date(reg.fechaApertura), "dd MMM, hh:mm a", { locale: es })}</td>
                      <td className="px-4 py-3 text-xs">{reg.fechaCierre ? format(new Date(reg.fechaCierre), "dd MMM, hh:mm a", { locale: es }) : 'Abierta'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-zinc-900">${reg.montoInicial.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-medium text-zinc-900">${reg.efectivoEsperado.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-bold text-zinc-900">{reg.efectivoContado !== undefined ? `$${reg.efectivoContado.toFixed(2)}` : 'N/A'}</td>
                      <td className="px-4 py-3 text-xs font-semibold">
                        {reg.diferencia !== undefined ? <span className={reg.diferencia >= 0 ? 'text-green-700' : 'text-red-700'}>${reg.diferencia.toFixed(2)}</span> : 'N/A'}
                      </td>
                      <td className="px-4 py-3"><Badge variant={reg.estado === 'Abierta' ? 'success' : 'neutral'}>{reg.estado}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rTp > 1 && (
                <div className="flex items-center justify-end gap-1 px-3 py-2 border-t border-zinc-100">
                  <button onClick={() => setRegPage((p) => Math.max(1, p - 1))} disabled={rSafePg === 1} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                  {rPageNums().map((pg, i) => pg === '...' ? <span key={`r-${i}`} className="px-1 text-xs text-zinc-400">…</span> : <button key={pg} onClick={() => setRegPage(pg as number)} className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-medium transition-colors ${rSafePg === pg ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>{pg}</button>)}
                  <button onClick={() => setRegPage((p) => Math.min(rTp, p + 1))} disabled={rSafePg === rTp} className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          );
        })()}
      </Card>

      {/* Aperture Modal */}
      <Modal
        isOpen={isOpeningModalOpen}
        onClose={() => setIsOpeningModalOpen(false)}
        title="Abrir Caja Diaria"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpeningModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={openForm.handleSubmit(handleOpenTurn)}
              isLoading={isOpening}
              className="cursor-pointer font-semibold"
            >
              Confirmar Apertura
            </Button>
          </>
        }
      >
        <form onSubmit={openForm.handleSubmit(handleOpenTurn)} className="space-y-4">
          <Input
            label="Efectivo Inicial en Caja ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={openForm.formState.errors.montoInicial?.message}
            {...openForm.register('montoInicial')}
          />
        </form>
      </Modal>

      {/* Closure Modal */}
      <Modal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        title="Cerrar Caja Diaria"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsClosingModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={closeForm.handleSubmit(handleCloseTurn)}
              isLoading={isClosing}
              className="cursor-pointer font-semibold"
            >
              Guardar y Cerrar
            </Button>
          </>
        }
      >
        <form onSubmit={closeForm.handleSubmit(handleCloseTurn)} className="space-y-4">
          <div className="p-3 border rounded-lg bg-zinc-50 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Efectivo inicial:</span>
              <span className="text-zinc-900 font-bold">${activeRegister?.montoInicial.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Ventas netas:</span>
              <span className="text-zinc-900 font-bold text-green-700">+${activeRegister?.ventas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Movimientos manuales (saldo):</span>
              <span className="text-zinc-900 font-bold">
                ${((activeRegister?.ingresos || 0) - (activeRegister?.egresos || 0)).toFixed(2)}
              </span>
            </div>
            <div className="h-px bg-zinc-200 my-1"></div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-900 font-bold">Total Esperado:</span>
              <span className="text-zinc-900 font-bold">${activeRegister?.efectivoEsperado.toFixed(2)}</span>
            </div>
          </div>
          <Input
            label="Efectivo Real Contado en Caja ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={closeForm.formState.errors.efectivoContado?.message}
            {...closeForm.register('efectivoContado')}
          />
        </form>
      </Modal>

      {/* Movement Modal */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Registrar Movimiento Manual"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsMovementModalOpen(false)}>Cancelar</Button>
            <Button
              onClick={movementForm.handleSubmit(handleCreateMovement)}
              isLoading={isAddingMovement}
              className="cursor-pointer font-semibold"
            >
              Registrar Movimiento
            </Button>
          </>
        }
      >
        <form onSubmit={movementForm.handleSubmit(handleCreateMovement)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Movimiento"
              options={[
                { label: 'Ingreso (+) ', value: 'Ingreso' },
                { label: 'Egreso (-)', value: 'Egreso' },
              ]}
              error={movementForm.formState.errors.tipo?.message}
              {...movementForm.register('tipo')}
            />
            <Input
              label="Monto ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={movementForm.formState.errors.monto?.message}
              {...movementForm.register('monto')}
            />
          </div>
          <Input
            label="Concepto"
            type="text"
            placeholder="ej. Pago a proveedor, Compra insumos"
            error={movementForm.formState.errors.concepto?.message}
            {...movementForm.register('concepto')}
          />
          <TextArea
            label="Descripción detallada (Opcional)"
            error={movementForm.formState.errors.descripción?.message}
            {...movementForm.register('descripción')}
          />
        </form>
      </Modal>
    </div>
  );
}
