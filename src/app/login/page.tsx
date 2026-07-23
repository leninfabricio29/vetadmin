'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../validators';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { z } from 'zod';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';

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
    <div className="min-h-screen flex selection:bg-zinc-950 selection:text-white relative bg-zinc-50 overflow-hidden font-sans">
      {/* Background abstract pastel shapes for right side */}
      <div className="absolute right-0 top-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-pink-100/40 blur-3xl opacity-60"></div>
      <div className="absolute right-10 bottom-0 -mr-20 -mb-20 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl opacity-60"></div>

      {/* Left Column: Visual hero panel (hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 flex-col justify-between p-12 overflow-hidden select-none border-r border-zinc-900">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-[350px] w-[350px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Brand header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black text-lg shadow-sm">
            V
          </div>
          <span className="font-bold text-lg text-white tracking-tight">VetGestion</span>
        </div>

        {/* Center content: Hero Illustration card */}
        <div className="my-auto relative z-10 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl relative group hover:border-white/15 transition-all duration-300">
            {/* Embedded generated 3D illustration asset */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 mb-6 flex items-center justify-center shadow-inner">
              <img
                src="https://static.vecteezy.com/system/resources/previews/017/352/346/non_2x/illustration-of-the-logo-of-a-veterinary-clinic-vector.jpg"
                alt="VetGestion Dashboard Illustration"
                className="object-cover h-full w-full opacity-90 group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/10">
                <Sparkles className="h-3 w-3 text-pink-400 fill-pink-400" /> Nueva Versión SaaS v2.0
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight pt-1">Lleva tu clínica al siguiente nivel</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Procesos POS de alta velocidad, kárdex de inventario en tiempo real y auditoría avanzada de comisiones.
              </p>
            </div>
          </div>
        </div>

        {/* Footer quote */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 relative z-10">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} VetGestion. Diseñado con</span>
            <Heart className="h-3 w-3 text-pink-500 fill-pink-500" /> por SofKilla.
          </div>
          <Link href="/" className="hover:text-zinc-300 flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a Inicio
          </Link>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header (shown on smaller screens) */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="lg:hidden h-10 w-10 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              V
            </div>
            <h2 className="mt-4 text-2xl font-black text-zinc-900 tracking-tight lg:mt-0">
              ¡Hola de nuevo!
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5">
              Ingresa tus credenciales para acceder al panel de administración de tu clínica.
            </p>
          </div>

          {/* Form container */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Usuario de Acceso"
                type="text"
                placeholder="Introduce tu usuario (ej. admin)"
                error={errors.usuario?.message}
                {...register('usuario')}
              />
              
              <div className="space-y-1">
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  error={errors.contraseña?.message}
                  {...register('contraseña')}
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-zinc-400 hover:text-zinc-650 cursor-pointer hover:underline transition-colors font-medium">
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full mt-2 cursor-pointer font-bold py-3 text-sm shadow-sm"
              >
                Ingresar al Sistema
              </Button>
            </form>
          </div>

          {/* Alternative action */}
          <div className="text-center space-y-3">
            <p className="text-xs text-zinc-500">
              ¿Tu clínica no está registrada?{' '}
              <Link href="/register" className="text-zinc-950 font-bold hover:underline">
                Regístrate gratis aquí
              </Link>
            </p>
            <div className="lg:hidden flex justify-center">
              <Link href="/" className="text-xs text-zinc-650 hover:text-zinc-950 flex items-center gap-1 font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" /> Volver a Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
