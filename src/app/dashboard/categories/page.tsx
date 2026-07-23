'use client';

import React, { useState } from 'react';
import { useCategories } from '../../../hooks/useCategories';
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
import { categorySchema } from '../../../validators';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { z } from 'zod';

type CategoryFormInputs = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const { categories, isLoading, error, refetch, createCategory, isCreating, updateCategory, isUpdating, deleteCategory } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormInputs>({
    resolver: zodResolver(categorySchema) as any,
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    reset({
      nombre: '',
      descripción: '',
      estado: 'Activo',
      comisiónPrincipal: 100,
      comisiónSecundario: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCategory(c);
    reset({
      nombre: c.nombre,
      descripción: c.descripción || '',
      estado: c.estado,
      comisiónPrincipal: c.comisiónPrincipal !== undefined ? c.comisiónPrincipal : 100,
      comisiónSecundario: c.comisiónSecundario !== undefined ? c.comisiónSecundario : 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: `Esta acción eliminará la categoría ${name} y desclasificará sus productos relacionados.`,
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
        await deleteCategory(id);
      }
    });
  };

  const onSubmit = async (data: CategoryFormInputs) => {
    const comPrincipal = parseFloat(data.comisiónPrincipal as any) || 0;
    const comSecundario = parseFloat(data.comisiónSecundario as any) || 0;
    if (comPrincipal + comSecundario !== 100) {
      toast.error('La suma de las comisiones (Principal + Secundario) debe ser exactamente igual a 100%.');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory._id, payload: data });
      } else {
        await createCategory(data);
      }
      setIsModalOpen(false);
    } catch (e) {
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.descripción && c.descripción.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Categorías</h1>
          <p className="text-xs text-zinc-500 mt-1">Administra las clasificaciones para catalogar los productos.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 cursor-pointer font-semibold sm:self-end">
          <Plus className="h-4 w-4" /> Nueva Categoría
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Buscar categorías por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
      ) : filteredCategories.length === 0 ? (
        <EmptyState title="No se encontraron categorías" description="Intente cambiar la búsqueda o añada una nueva categoría." />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Descripción</th>
                  <th className="px-6 py-3">Comisiones Defecto</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredCategories.map((c) => (
                  <tr key={c._id} className="text-zinc-650 hover:bg-zinc-50/30">
                    <td className="px-6 py-4 font-medium text-zinc-900 truncate">{c.nombre}</td>
                    <td className="px-6 py-4 truncate max-w-[300px]">{c.descripción || 'Sin descripción'}</td>
                    <td className="px-6 py-4">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded">
                        {c.comisiónPrincipal !== undefined ? c.comisiónPrincipal : 100}% P / {c.comisiónSecundario !== undefined ? c.comisiónSecundario : 0}% S
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.estado === 'Activo' ? 'success' : 'danger'}>
                        {c.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(c)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-1.5 text-red-650 cursor-pointer" onClick={() => handleDelete(c._id, c.nombre)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
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
          <Input label="Nombre de Categoría" type="text" error={errors.nombre?.message} {...register('nombre')} />
          <TextArea label="Descripción (Opcional)" error={errors.descripción?.message} {...register('descripción')} />
          <Select
            label="Estado"
            options={[
              { label: 'Activo', value: 'Activo' },
              { label: 'Inactivo', value: 'Inactivo' },
            ]}
            error={errors.estado?.message}
            {...register('estado')}
          />
          <div className="grid grid-cols-2 gap-4 border-t pt-3 border-dashed border-zinc-200">
            <Input
              label="Comisión Principal (%)"
              type="number"
              min="0"
              max="100"
              error={errors.comisiónPrincipal?.message}
              {...register('comisiónPrincipal')}
            />
            <Input
              label="Comisión Secundario (%)"
              type="number"
              min="0"
              max="100"
              error={errors.comisiónSecundario?.message}
              {...register('comisiónSecundario')}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
