'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../validators';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { z } from 'zod';

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = (data: LoginFormInputs) => {
    login({ usuario: data.usuario, contrasenia: data.contraseña });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-8 shadow-xs">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">V</div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900 tracking-tight">VetGestion</h2>
          <p className="text-xs text-zinc-500 mt-1">Inicia sesión para acceder al panel administrativo</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Usuario"
            type="text"
            placeholder="Introduce tu usuario"
            error={errors.usuario?.message}
            {...register('usuario')}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.contraseña?.message}
            {...register('contraseña')}
          />
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 cursor-pointer font-semibold"
          >
            Acceder
          </Button>
        </form>
      </div>
    </div>
  );
}
