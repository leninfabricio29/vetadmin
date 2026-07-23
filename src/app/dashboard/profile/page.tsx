'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../store/auth.store';
import { apiClient } from '../../../lib/axios';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { User, KeyRound, Building, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const profileSchema = z.object({
  nombres: z.string().min(1, 'Los nombres son obligatorios.'),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios.'),
  email: z.string().email('Debe ingresar un correo electrónico válido.'),
  teléfono: z.string().min(1, 'El teléfono es obligatorio.'),
  usuario: z.string().min(4, 'El usuario debe tener al menos 4 caracteres.'),
});

const passwordSchema = z.object({
  contraseñaActual: z.string().min(1, 'Debe ingresar la contraseña actual.'),
  contraseñaNueva: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres.'),
  confirmarNueva: z.string().min(1, 'Confirme su nueva contraseña.'),
}).refine((data) => data.contraseñaNueva === data.confirmarNueva, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmarNueva'],
});

type ProfileInputs = z.infer<typeof profileSchema>;
type PasswordInputs = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileInputs>({
    resolver: zodResolver(profileSchema) as any,
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema) as any,
  });

  useEffect(() => {
    if (user) {
      setProfileValue('nombres', user.nombres);
      setProfileValue('apellidos', user.apellidos);
      setProfileValue('email', user.email);
      setProfileValue('teléfono', user.teléfono || '');
      setProfileValue('usuario', user.usuario);
    }
  }, [user, setProfileValue]);

  const onUpdateProfile = async (data: ProfileInputs) => {
    setIsUpdatingProfile(true);
    try {
      const response = await apiClient.put('/auth/profile', data);
      updateUser(response.data.data);
      toast.success('Perfil actualizado correctamente.');
    } catch (error: any) {
      const msg = error.message || 'No se pudo actualizar el perfil.';
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordInputs) => {
    setIsChangingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        contraseñaActual: data.contraseñaActual,
        contraseñaNueva: data.contraseñaNueva,
      });
      resetPassword();
      Swal.fire({
        title: '¡Contraseña Cambiada!',
        text: 'Tu contraseña ha sido actualizada con éxito.',
        icon: 'success',
        confirmButtonColor: '#09090b',
      });
    } catch (error: any) {
      const msg = error.message || 'No se pudo cambiar la contraseña.';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateTheme = async (themeId: string) => {
    try {
      await apiClient.put('/auth/veterinaria', {
        preferencias: { tema: themeId },
      });
      if (user) {
        const updatedUser = {
          ...user,
          veterinaria: {
            ...user.veterinaria!,
            preferencias: { tema: themeId },
          },
        };
        updateUser(updatedUser);
      }
      toast.success('Preferencia de tema actualizada.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la preferencia de tema.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 select-none max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Mi Cuenta</h1>
        <p className="text-xs text-zinc-500 mt-1">Gestiona tu información personal y configuraciones de seguridad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Veterinary info summary */}
        {user.veterinaria && (
          <Card className="p-5 flex flex-col items-center text-center space-y-4 md:col-span-1 border border-zinc-200">
            <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-inner">
              <Building className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Veterinaria Activa</span>
              <h2 className="text-sm font-bold text-zinc-900 truncate max-w-[200px] mt-0.5">{user.veterinaria.nombre}</h2>
              <p className="text-[10px] font-mono text-zinc-500 mt-1">RUC: {user.veterinaria.RUC}</p>
            </div>
            
            <div className="w-full border-t border-dashed border-zinc-150 pt-3 text-left space-y-2 text-[11px] text-zinc-600">
              {user.veterinaria.dirección && (
                <div><b>Dir:</b> {user.veterinaria.dirección}</div>
              )}
              {user.veterinaria.teléfono && (
                <div><b>Telf:</b> {user.veterinaria.teléfono}</div>
              )}
              {user.veterinaria.email && (
                <div><b>Email:</b> {user.veterinaria.email}</div>
              )}
            </div>
          </Card>
        )}

        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <Card className="p-6 border border-zinc-200">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100">
              <User className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-900">Datos Personales</h3>
            </div>

            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombres"
                  type="text"
                  error={profileErrors.nombres?.message}
                  {...registerProfile('nombres')}
                />
                <Input
                  label="Apellidos"
                  type="text"
                  error={profileErrors.apellidos?.message}
                  {...registerProfile('apellidos')}
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  error={profileErrors.email?.message}
                  {...registerProfile('email')}
                />
                <Input
                  label="Teléfono"
                  type="text"
                  error={profileErrors.teléfono?.message}
                  {...registerProfile('teléfono')}
                />
                <Input
                  label="Nombre de Usuario"
                  type="text"
                  error={profileErrors.usuario?.message}
                  {...registerProfile('usuario')}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500">Rol asignado</label>
                  <input
                    type="text"
                    disabled
                    value={user.rol}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isUpdatingProfile} className="cursor-pointer font-semibold px-6">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card className="p-6 border border-zinc-200">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100">
              <KeyRound className="h-4 w-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-900">Cambiar Contraseña</h3>
            </div>

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Contraseña Actual"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.contraseñaActual?.message}
                  {...registerPassword('contraseñaActual')}
                />
                <Input
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.contraseñaNueva?.message}
                  {...registerPassword('contraseñaNueva')}
                />
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.confirmarNueva?.message}
                  {...registerPassword('confirmarNueva')}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isChangingPassword} className="cursor-pointer font-semibold px-6">
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </Card>

          {/* Theme customizer Card (Admin only) */}
          {user.rol === 'Administrador' && (
            <Card className="p-6 border border-zinc-200">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-100">
                <Palette className="h-4 w-4 text-zinc-500" />
                <h3 className="text-sm font-bold text-zinc-900">Personalización de la Clínica</h3>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-500">
                  Elige un tono pastel para la interfaz del sistema de tu veterinaria. Esta preferencia se aplicará para todos los colaboradores de tu clínica.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { id: 'default', label: 'Elegante (Zinc)', primaryColor: '#09090b' },
                    { id: 'rosa', label: 'Rosa Pastel', primaryColor: '#ec4899' },
                    { id: 'menta', label: 'Verde Menta', primaryColor: '#10b981' },
                    { id: 'celeste', label: 'Azul Celeste', primaryColor: '#0ea5e9' },
                  ].map((t) => {
                    const isSelected = (user.veterinaria?.preferencias?.tema || 'default') === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleUpdateTheme(t.id)}
                        className={`flex flex-col items-center gap-2.5 p-3.5 border rounded-xl hover:border-zinc-300 transition-all cursor-pointer ${
                          isSelected ? 'border-zinc-900 bg-zinc-50/50 shadow-xs ring-1 ring-zinc-900' : 'border-zinc-200 bg-white'
                        }`}
                      >
                        <div
                          className="h-7 w-7 rounded-full shadow-inner border border-white"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        <span className="text-[11px] font-bold text-zinc-700">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
