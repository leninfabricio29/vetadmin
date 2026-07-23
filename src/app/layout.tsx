import React from 'react';
import type { Metadata } from 'next';
import QueryProvider from '../providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'VetGestion - Sistema de Gestión Veterinaria',
  description: 'Sistema administrativo profesional para clínicas veterinarias y puntos de venta.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
