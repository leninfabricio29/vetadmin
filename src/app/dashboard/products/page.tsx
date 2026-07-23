'use client';

import React, { useState } from 'react';
import { useProducts } from '../../../hooks/useProducts';
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
import { productSchema } from '../../../validators';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { z } from 'zod';

type ProductFormInputs = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const { products, isLoading, error, refetch, createProduct, isCreating, updateProduct, isUpdating, deleteProduct } = useProducts();
  const { categories, isLoading: loadingCategories } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productSchema) as any,
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      código: '',
      nombre: '',
      descripción: '',
      categoría: '',
      precioCompra: 0,
      precioVenta: 0,
      stock: 0,
      stockMínimo: 5,
      unidad: 'Unidad',
      proveedor: '',
      estado: 'Activo',
      tieneIva: false,
      comisiónPrincipal: '' as any,
      comisiónSecundario: '' as any,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    const catId = typeof p.categoría === 'object' ? p.categoría._id : p.categoría;
    reset({
      código: p.código,
      nombre: p.nombre,
      descripción: p.descripción || '',
      categoría: catId,
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stock: p.stock,
      stockMínimo: p.stockMínimo,
      unidad: p.unidad,
      proveedor: p.proveedor,
      estado: p.estado,
      tieneIva: p.tieneIva || false,
      comisiónPrincipal: p.comisiónPrincipal !== undefined && p.comisiónPrincipal !== null ? p.comisiónPrincipal : '' as any,
      comisiónSecundario: p.comisiónSecundario !== undefined && p.comisiónSecundario !== null ? p.comisiónSecundario : '' as any,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `Esta acción eliminará el producto ${name} y alterará el stock del inventario.`,
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
        await deleteProduct(id);
      }
    });
  };

  const onSubmit = async (data: ProductFormInputs) => {
    const hasComPrincipal = data.comisiónPrincipal !== undefined && data.comisiónPrincipal !== null && (data.comisiónPrincipal as any) !== '';
    const hasComSecundario = data.comisiónSecundario !== undefined && data.comisiónSecundario !== null && (data.comisiónSecundario as any) !== '';

    if (hasComPrincipal || hasComSecundario) {
      const comPrincipal = parseFloat(data.comisiónPrincipal as any) || 0;
      const comSecundario = parseFloat(data.comisiónSecundario as any) || 0;
      if (comPrincipal + comSecundario !== 100) {
        toast.error('La suma de las comisiones (Principal + Secundario) debe ser exactamente igual a 100%.');
        return;
      }
    }

    const payload = { ...data };
    if (!hasComPrincipal) {
      delete (payload as any).comisiónPrincipal;
    } else {
      payload.comisiónPrincipal = parseFloat(data.comisiónPrincipal as any);
    }
    if (!hasComSecundario) {
      delete (payload as any).comisiónSecundario;
    } else {
      payload.comisiónSecundario = parseFloat(data.comisiónSecundario as any);
    }

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, payload });
      } else {
        await createProduct(payload);
      }
      setIsModalOpen(false);
    } catch (e) {
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.código.toLowerCase().includes(search.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(search.toLowerCase())
  );

  const categoryOptions = categories.map((c) => ({
    label: c.nombre,
    value: c._id,
  }));

  const getStockVariant = (stock: number, min: number) => {
    if (stock === 0) return 'danger';
    if (stock <= min) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Inventario de Productos</h1>
          <p className="text-xs text-zinc-500 mt-1">Supervisa existencias, costos y precios de venta al público.</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 cursor-pointer font-semibold sm:self-end">
          <Plus className="h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Buscar por código, nombre o proveedor..."
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
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="No se encontraron productos" description="Intente cambiar la búsqueda o registre un nuevo producto." />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Precio Venta</th>
                  <th className="px-6 py-3">Precio Compra</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Proveedor</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredProducts.map((p) => {
                  const catName = typeof p.categoría === 'object' ? p.categoría.nombre : 'General';
                  return (
                    <tr key={p._id} className="text-zinc-650 hover:bg-zinc-50/30">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-900">{p.código}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900 truncate max-w-[200px] flex items-center gap-1.5">
                        <span>{p.nombre}</span>
                        {p.tieneIva && (
                          <span className="px-1 py-0.5 text-[9px] font-bold tracking-wider text-green-700 bg-green-50 border border-green-200 rounded select-none">
                            IVA
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">{catName}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">${p.precioVenta.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">${p.precioCompra.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStockVariant(p.stock, p.stockMínimo)}>
                          {p.stock === 0 ? 'Agotado' : `${p.stock} ${p.unidad}`}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 truncate max-w-[120px]">{p.proveedor}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="p-1.5 cursor-pointer" onClick={() => handleOpenEdit(p)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1.5 text-red-650 cursor-pointer" onClick={() => handleDelete(p._id, p.nombre)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
            <Input label="Código de Barras/SKU" type="text" error={errors.código?.message} {...register('código')} />
            <Input label="Nombre de Producto" type="text" error={errors.nombre?.message} {...register('nombre')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoría"
              options={categoryOptions}
              placeholder={loadingCategories ? 'Cargando...' : 'Seleccione categoría'}
              error={errors.categoría?.message}
              {...register('categoría')}
            />
            <Input label="Unidad de Medida (ej. Unidad, Caja)" type="text" error={errors.unidad?.message} {...register('unidad')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio de Compra" type="number" step="0.01" error={errors.precioCompra?.message} {...register('precioCompra')} />
            <Input label="Precio de Venta al Público" type="number" step="0.01" error={errors.precioVenta?.message} {...register('precioVenta')} />
            <div className="flex items-center gap-2 pt-2 col-span-2">
              <input
                id="tieneIva"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                {...register('tieneIva')}
              />
              <label htmlFor="tieneIva" className="text-xs font-semibold text-zinc-700 select-none cursor-pointer">
                Este producto grava IVA ({process.env.NEXT_PUBLIC_TAX_VALOR || '15'}%)
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Inicial" type="number" error={errors.stock?.message} {...register('stock')} />
            <Input label="Stock Mínimo (Alerta)" type="number" error={errors.stockMínimo?.message} {...register('stockMínimo')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Proveedor" type="text" error={errors.proveedor?.message} {...register('proveedor')} />
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
          <div className="grid grid-cols-2 gap-4 border-t pt-3 border-dashed border-zinc-200">
            <Input
              label="Comisión Principal (%) [Opcional]"
              placeholder="Hereda de categoría"
              type="number"
              min="0"
              max="100"
              error={errors.comisiónPrincipal?.message}
              {...register('comisiónPrincipal')}
            />
            <Input
              label="Comisión Secundario (%) [Opcional]"
              placeholder="Hereda de categoría"
              type="number"
              min="0"
              max="100"
              error={errors.comisiónSecundario?.message}
              {...register('comisiónSecundario')}
            />
          </div>
          <TextArea label="Descripción de Producto (Opcional)" error={errors.descripción?.message} {...register('descripción')} />
        </form>
      </Modal>
    </div>
  );
}
