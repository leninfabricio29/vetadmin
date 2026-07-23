import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/client.service';
import toast from 'react-hot-toast';

export const useClients = (search?: string) => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientService.getAll(search),
  });

  const createClientMutation = useMutation({
    mutationFn: (payload: any) => clientService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente registrado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar cliente.');
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => clientService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente actualizado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar cliente.');
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente eliminado exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar cliente.');
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    error: clientsQuery.error,
    refetch: clientsQuery.refetch,
    createClient: createClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    updateClient: updateClientMutation.mutateAsync,
    isUpdating: updateClientMutation.isPending,
    deleteClient: deleteClientMutation.mutateAsync,
    isDeleting: deleteClientMutation.isPending,
  };
};
