'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/auth.store';
import { ShoppingCart, Package, BarChart3, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col justify-between selection:bg-zinc-950 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-base shadow-sm">
              V
            </div>
            <span className="font-bold text-lg text-zinc-950 tracking-tight">VetGestion</span>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                Ir al Panel <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg shadow-xs transition-all"
                >
                  Empieza Ya
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-900" /> Plataforma SaaS Multi-tenant
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tight leading-[1.05]">
              Administración Inteligente para tu <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-650 bg-clip-text text-transparent">Veterinaria</span>.
            </h1>
            <p className="text-sm sm:text-base text-zinc-555 leading-relaxed max-w-xl">
              El software de facturación POS de alta velocidad y control de inventarios diseñado para consultorios y clínicas veterinarias modernas. Scoping seguro, comisiones sobre utilidad real y reportes avanzados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="px-6 py-3.5 text-sm font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                Registrar mi Clínica <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 text-sm font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl shadow-xs transition-all text-center cursor-pointer"
              >
                Ver demo / Ingresar
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs hover:border-zinc-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-zinc-950">POS Venta de Alta Velocidad</h3>
              <p className="text-xs text-zinc-500 leading-normal">
                Cobros rápidos, impuestos automáticos, comprobantes de pago digitalizables e impresión física de tickets POS.
              </p>
            </div>

            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs hover:border-zinc-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-zinc-950">Catálogo e Inventario Real</h3>
              <p className="text-xs text-zinc-500 leading-normal">
                Alertas inteligentes de stock mínimo, trazabilidad del kárdex de ingresos/salidas y comisiones heredables por categoría.
              </p>
            </div>

            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs hover:border-zinc-300 transition-all space-y-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-zinc-950">Reportes de Comisión y Caja</h3>
              <p className="text-xs text-zinc-500 leading-normal">
                Liquidaciones basadas en la utilidad real <span className="font-semibold text-zinc-800">(precioVenta - precioCompra)</span> con filtro avanzado por cajero.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-450">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} VetGestion. Desarrollado con</span>
            <Heart className="h-3.5 w-3.5 text-zinc-900 fill-zinc-900" />
            <span>para clínicas modernas.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-zinc-900">Ingresar</Link>
            <Link href="/register" className="hover:text-zinc-900">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
