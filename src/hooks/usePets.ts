import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/pet.service';
import toast from 'react-hot-toast';

export const usePets = (ownerId?: string) => {
  const queryClient = useQueryClient();

  const petsQuery = useQuery({
    queryKey: ownerId ? ['pets', 'owner', ownerId] : ['pets'],
    queryFn: () => (ownerId ? petService.getByOwner(ownerId) : petService.getAll()),
  });

  const createPetMutation = useMutation({
    mutationFn: (payload: any) => petService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota registrada exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar mascota.');
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => petService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota actualizada exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar mascota.');
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: (id: string) => petService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota eliminada exitosamente.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar mascota.');
    },
  });

  return {
    pets: petsQuery.data || [],
    isLoading: petsQuery.isLoading,
    error: petsQuery.error,
    refetch: petsQuery.refetch,
    createPet: createPetMutation.mutateAsync,
    isCreating: createPetMutation.isPending,
    updatePet: updatePetMutation.mutateAsync,
    isUpdating: updatePetMutation.isPending,
    deletePet: deletePetMutation.mutateAsync,
    isDeleting: deletePetMutation.isPending,
  };
};
