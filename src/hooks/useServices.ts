import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/service.service';
import toast from 'react-hot-toast';

export const useServices = () => {
  const queryClient = useQueryClient();

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceService.getAll(),
  });

  const createServiceMutation = useMutation({
    mutationFn: (payload: any) => serviceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Servicio registrado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar servicio.');
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => serviceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Servicio actualizado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar servicio.');
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Servicio eliminado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar servicio.');
    },
  });

  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,
    createService: createServiceMutation.mutateAsync,
    isCreating: createServiceMutation.isPending,
    updateService: updateServiceMutation.mutateAsync,
    isUpdating: updateServiceMutation.isPending,
    deleteService: deleteServiceMutation.mutateAsync,
    isDeleting: deleteServiceMutation.isPending,
  };
};
