'use client';

import React, { useState, useEffect } from 'react';
import { useClients } from '../../../hooks/useClients';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '../../../validators';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { z } from 'zod';

type ClientFormInputs = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const { clients, isLoading, error, refetch, createClient, isCreating, updateClient, isUpdating, deleteClient } = useClients(search);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormInputs>({
    resolver: zodResolver(clientSchema) as any,
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    reset({
      nombres: '',
      apellidos: '',
      cédula: '',
      teléfono: '',
      email: '',
      dirección: '',
      observaciones: '',
      estado: 'Activo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingClient(c);
    reset({
      nombres: c.nombres,
      apellidos: c.apellidos,
      cédula: c.cédula,
      teléfono: c.teléfono,
      email: c.email,
      dirección: c.dirección,
      observaciones: c.observaciones || '',
      estado: c.estado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: '¿Eliminar cliente?',
      text: `Esta acción eliminará al cliente ${name} y desvinculará sus mascotas del panel.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#f4f4f5',
      customClass: {
        confirmButton: 'text-white border-0 px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500',
        cancelButton: 'text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white hover:bg-zinc-50'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteClient(id);
      }
    });
  };

  const onSubmit = async (data: ClientFormInputs) => {
    try {
      if (editingClient) {
        await updateClient({ id: editingClient._id, payload: data });
      } else {
        await createClient(data);
      }
      setIsModalOpen(false);
    } catch (e) {
    }
  };

  const totalRecords = clients.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedClients = clients.slice(startIndex, endIndex);

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Clientes</h1>
          <p className="text-xs text-zinc-500 mt-1">Registra y administra los datos de los propietarios de mascotas.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 cursor-pointer font-semibold sm:self-end">
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Buscar por cédula, nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : clients.length === 0 ? (
        <EmptyState title="No se encontraron clientes" description="Intente cambiar la búsqueda o añada un nuevo cliente." />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Cédula</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedClients.map((c) => (
                  <tr key={c._id} className="text-zinc-650 hover:bg-zinc-50/30">
                    <td className="px-6 py-4 font-medium text-zinc-900 truncate">{c.nombres} {c.apellidos}</td>
                    <td className="px-6 py-4">{c.cédula}</td>
                    <td className="px-6 py-4">{c.teléfono}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]">{c.dirección}</td>
                    <td className="px-6 py-4">
                      <Badge variant={c.estado === 'Activo' ? 'success' : 'danger'}>
                        {c.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(c)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1.5 text-red-650 cursor-pointer" onClick={() => handleDelete(c._id, `${c.nombres} ${c.apellidos}`)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isCreating || isUpdating} className="font-semibold cursor-pointer">
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombres" type="text" error={errors.nombres?.message} {...register('nombres')} />
            <Input label="Apellidos" type="text" error={errors.apellidos?.message} {...register('apellidos')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cédula/DNI" type="text" error={errors.cédula?.message} {...register('cédula')} />
            <Input label="Teléfono" type="text" error={errors.teléfono?.message} {...register('teléfono')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Select
              label="Estado"
              options={[
                { label: 'Activo', value: 'Activo' },
                { label: 'Inactivo', value: 'Inactivo' },
              ]}
              error={errors.estado?.message}
              {...register('estado')}
            />
          </div>
          <Input label="Dirección" type="text" error={errors.dirección?.message} {...register('dirección')} />
          <TextArea label="Observaciones (Opcional)" error={errors.observaciones?.message} {...register('observaciones')} />
        </form>
      </Modal>
    </div>
  );
}
