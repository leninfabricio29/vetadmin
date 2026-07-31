'use client';

import React, { useState, useEffect } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { useAuthStore } from '../../../store/auth.store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '../../../validators';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { z } from 'zod';

type UserFormInputs = z.infer<typeof userSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const { users, isLoading, error, refetch, createUser, isCreating, updateUser, isUpdating, deleteUser } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema) as any,
  });

  if (currentUser?.rol !== 'Administrador') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-sm font-bold text-zinc-950">Acceso Denegado</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">Este módulo es de uso exclusivo para Administradores del sistema.</p>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset({
      nombres: '',
      apellidos: '',
      email: '',
      teléfono: '',
      usuario: '',
      contraseña: '',
      rol: 'Recepcionista',
      estado: 'Activo',
      tipoComisión: 'Secundario',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    reset({
      nombres: u.nombres,
      apellidos: u.apellidos,
      email: u.email,
      teléfono: u.teléfono,
      usuario: u.usuario,
      rol: u.rol,
      estado: u.estado,
      contraseña: '',
      tipoComisión: u.tipoComisión || 'Secundario',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Esta acción eliminará permanentemente al usuario ${name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#f4f4f5',
      customClass: {
        confirmButton: 'text-white border-0 px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500',
        cancelButton: 'text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white hover:bg-zinc-50 animate-none'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUser(id);
      }
    });
  };

  const onSubmit = async (data: UserFormInputs) => {
    try {
      if (editingUser) {
        const payload = { ...data };
        if (!payload.contraseña) delete payload.contraseña;
        await updateUser({ id: editingUser._id, payload });
      } else {
        await createUser(data);
      }
      setIsModalOpen(false);
    } catch (e) {
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nombres.toLowerCase().includes(search.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      u.usuario.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecords = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Usuarios</h1>
          <p className="text-xs text-zinc-500 mt-1">Administra los usuarios del sistema y sus roles de acceso.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 cursor-pointer font-semibold sm:self-end">
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Buscar por nombre o usuario..."
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
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No se encontraron usuarios" description="Intente cambiar los filtros o añada un nuevo usuario." />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Correo</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Comisión</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedUsers.map((u) => (
                  <tr key={u._id} className="text-zinc-650 hover:bg-zinc-50/30">
                    <td className="px-6 py-4 font-medium text-zinc-900 truncate">{u.nombres} {u.apellidos}</td>
                    <td className="px-6 py-4">{u.usuario}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase">{u.rol}</td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {u.tipoComisión === 'Principal' ? (
                        <span className="text-zinc-900 font-bold text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 uppercase tracking-wide">Principal</span>
                      ) : (
                        <span className="text-zinc-660">Secundario</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.estado === 'Activo' ? 'success' : 'danger'}>
                        {u.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(u)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1.5 text-red-650 cursor-pointer" onClick={() => handleDelete(u._id, `${u.nombres} ${u.apellidos}`)}>
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
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Teléfono" type="text" error={errors.teléfono?.message} {...register('teléfono')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usuario" type="text" error={errors.usuario?.message} {...register('usuario')} disabled={!!editingUser} />
            <Input label={editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'} type="password" error={errors.contraseña?.message} {...register('contraseña')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Rol"
              options={[
                { label: 'Administrador', value: 'Administrador' },
                { label: 'Veterinario', value: 'Veterinario' },
                { label: 'Cajero', value: 'Cajero' },
                { label: 'Recepcionista', value: 'Recepcionista' },
              ]}
              error={errors.rol?.message}
              {...register('rol')}
            />
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
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Tipo de Comisión"
              options={[
                { label: 'Principal', value: 'Principal' },
                { label: 'Secundario', value: 'Secundario' },
              ]}
              error={errors.tipoComisión?.message}
              {...register('tipoComisión')}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
