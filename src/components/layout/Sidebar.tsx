'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth.store';
import { useRegisterStore } from '@/src/store/register.store';
import {
  LayoutDashboard,
  User,
  Users,
  PawPrint,
  Tag,
  Package,
  HeartPulse,
  Wallet,
  ShoppingCart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import Swal from 'sweetalert2';

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isCajaOpen = useRegisterStore((state) => state.isOpen);

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que iniciar sesión nuevamente para acceder al sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#18181b',
      cancelButtonColor: '#f4f4f5',
      customClass: {
        confirmButton: 'text-white border-0 px-4 py-2 rounded-lg text-sm bg-zinc-900 hover:bg-zinc-800',
        cancelButton: 'text-zinc-700 border border-zinc-200 px-4 py-2 rounded-lg text-sm bg-white hover:bg-zinc-50'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const menuSections = [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Administrador', 'Veterinario', 'Cajero', 'Recepcionista'] },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { label: 'POS Venta', href: '/dashboard/sales/pos', icon: ShoppingCart, roles: ['Administrador', 'Cajero'], badge: isCajaOpen ? 'Abierta' : 'Cerrada' },
        { label: 'Ventas Realizadas', href: '/dashboard/sales', icon: ShoppingCart, roles: ['Administrador', 'Cajero'] },
        { label: 'Caja Diaria', href: '/dashboard/cash', icon: Wallet, roles: ['Administrador', 'Cajero'] },
      ]
    },
    {
      title: 'Catálogo e Inventario',
      items: [
        { label: 'Productos', href: '/dashboard/products', icon: Package, roles: ['Administrador', 'Veterinario', 'Recepcionista', 'Cajero'] },
        { label: 'Categorías', href: '/dashboard/categories', icon: Tag, roles: ['Administrador', 'Veterinario', 'Recepcionista'] },
      ]
    },
    {
      title: 'Administración',
      items: [
        { label: 'Clientes', href: '/dashboard/clients', icon: Users, roles: ['Administrador', 'Veterinario', 'Recepcionista'] },
        { label: 'Usuarios', href: '/dashboard/users', icon: User, roles: ['Administrador'] },
        { label: 'Reportes', href: '/dashboard/reports', icon: BarChart3, roles: ['Administrador'] },
      ]
    },
    {
      title: 'Ajustes',
      items: [
        { label: 'Mi Cuenta', href: '/dashboard/profile', icon: User, roles: ['Administrador', 'Veterinario', 'Cajero', 'Recepcionista'] },
      ]
    }
  ];

  return (
    <aside
      className={clsx(
        'flex flex-col border-r border-zinc-200 bg-white text-zinc-700 transition-all duration-300 select-none h-screen sticky top-0 z-40',
        {
          'w-64': !isCollapsed,
          'w-16': isCollapsed,
        }
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 h-16 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">V</div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">VetGestion</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors mx-auto cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {menuSections.map((section) => {
          const filteredItems = section.items.filter((item) => user && item.roles.includes(user.rol));
          if (filteredItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <span className="block px-3 text-[9px] font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  {section.title}
                </span>
              )}
              {filteredItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                      {
                        'bg-primary text-primary-foreground': isActive,
                        'hover:bg-primary-light text-zinc-650 hover:text-zinc-900': !isActive,
                        'justify-center': isCollapsed,
                      }
                    )}
                  >
                    <Icon className={clsx('h-4 w-4 shrink-0', { 'text-zinc-500 group-hover:text-zinc-950': !isActive })} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {item.badge && !isCollapsed && (
                      <span
                        className={clsx(
                          'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider border',
                          {
                            'bg-green-50 text-green-700 border-green-200': item.badge === 'Abierta',
                            'bg-red-50 text-red-700 border-red-200': item.badge === 'Cerrada',
                          }
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex flex-col gap-2 shrink-0">
        {!isCollapsed && user && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
              {user.nombres[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 truncate">{user.nombres} {user.apellidos}</p>
              <p className="text-[10px] text-zinc-500 font-medium truncate">{user.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 hover:text-red-700 rounded-lg transition-colors w-full cursor-pointer',
            { 'justify-center': isCollapsed }
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
