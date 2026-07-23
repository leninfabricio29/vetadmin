import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const loginState = useAuthStore((state) => state.login);
  const logoutState = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: ({ usuario, contrasenia }: { usuario: string; contrasenia: string }) =>
      authService.login(usuario, contrasenia),
    onSuccess: (data) => {
      loginState(data.token, data.user);
      toast.success(`Bienvenido, ${data.user.nombres}`);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Credenciales inválidas');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ contraseniaActual, contraseniaNueva }: { contraseniaActual: string; contraseniaNueva: string }) =>
      authService.changePassword(contraseniaActual, contraseniaNueva),
    onSuccess: () => {
      toast.success('Contraseña cambiada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cambiar contraseña');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChanging: changePasswordMutation.isPending,
    logout: logoutState,
  };
};
