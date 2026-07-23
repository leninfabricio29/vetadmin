'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import Swal from 'sweetalert2';

const registerValidationSchema = z.object({
  vetNombre: z.string().min(1, 'El nombre de la veterinaria es obligatorio.'),
  vetRUC: z.string().min(10, 'El RUC debe tener al menos 10 dígitos.'),
  vetDirección: z.string().optional(),
  vetTeléfono: z.string().optional(),
  vetEmail: z.string().email('Debe ingresar un correo electrónico válido para la veterinaria.'),
  adminNombres: z.string().min(1, 'Los nombres son obligatorios.'),
  adminApellidos: z.string().min(1, 'Los apellidos son obligatorios.'),
  adminEmail: z.string().email('Debe ingresar un correo electrónico válido para el administrador.'),
  adminUsuario: z.string().min(4, 'El usuario del administrador debe tener al menos 4 caracteres.'),
  adminTeléfono: z.string().min(1, 'El teléfono del administrador es obligatorio.'),
});

type RegisterFormInputs = z.infer<typeof registerValidationSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerValidationSchema) as any,
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', data);
      
      Swal.fire({
        title: '¡Clínica Registrada!',
        text: `Se ha creado tu veterinaria y se envió un correo a ${data.adminEmail} con tu contraseña temporal. Revisa tu bandeja de entrada o spam.`,
        icon: 'success',
        confirmButtonText: 'Ir a Iniciar Sesión',
        confirmButtonColor: '#09090b',
      }).then(() => {
        router.push('/login');
      });
    } catch (error: any) {
      const msg = error.message || 'No se pudo completar el registro.';
      Swal.fire({
        title: 'Error de Registro',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 select-none">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-xl p-8 shadow-xs">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-lg">V</div>
          <h2 className="mt-4 text-xl font-bold text-zinc-900 tracking-tight">Registra tu Veterinaria</h2>
          <p className="text-xs text-zinc-500 mt-1">Crea tu cuenta de clínica e inicia en segundos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Veterinary Data */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-100">Datos de la Veterinaria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la Clínica"
                type="text"
                placeholder="Veterinaria PetCare"
                error={errors.vetNombre?.message}
                {...register('vetNombre')}
              />
              <Input
                label="RUC de la Clínica"
                type="text"
                placeholder="1792847596001"
                error={errors.vetRUC?.message}
                {...register('vetRUC')}
              />
              <Input
                label="Correo de la Clínica"
                type="email"
                placeholder="contacto@clinicavet.com"
                error={errors.vetEmail?.message}
                {...register('vetEmail')}
              />
              <Input
                label="Teléfono de la Clínica"
                type="text"
                placeholder="022555666"
                error={errors.vetTeléfono?.message}
                {...register('vetTeléfono')}
              />
            </div>
            <div className="mt-4">
              <Input
                label="Dirección Física"
                type="text"
                placeholder="Av. Principal y Calle Secundaria"
                error={errors.vetDirección?.message}
                {...register('vetDirección')}
              />
            </div>
          </div>

          {/* Admin User Data */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-100">Datos del Administrador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombres"
                type="text"
                placeholder="Juan Carlos"
                error={errors.adminNombres?.message}
                {...register('adminNombres')}
              />
              <Input
                label="Apellidos"
                type="text"
                placeholder="Pérez López"
                error={errors.adminApellidos?.message}
                {...register('adminApellidos')}
              />
              <Input
                label="Correo del Administrador"
                type="email"
                placeholder="juan.perez@email.com"
                error={errors.adminEmail?.message}
                {...register('adminEmail')}
              />
              <Input
                label="Teléfono Móvil"
                type="text"
                placeholder="0998887777"
                error={errors.adminTeléfono?.message}
                {...register('adminTeléfono')}
              />
            </div>
            <div className="mt-4 w-full md:w-1/2 md:pr-2">
              <Input
                label="Nombre de Usuario"
                type="text"
                placeholder="juan.admin"
                error={errors.adminUsuario?.message}
                {...register('adminUsuario')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t pt-4 border-dashed border-zinc-200">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full cursor-pointer font-bold py-3"
            >
              Completar Registro
            </Button>
            
            <p className="text-center text-xs text-zinc-500">
              ¿Ya tienes una clínica registrada?{' '}
              <Link href="/login" className="text-zinc-950 font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
