'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useCashRegister } from '@/src/hooks/useCashRegister';
import { useAuthStore } from '@/src/store/auth.store';
import { useRouter } from 'next/navigation';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { refetchActive } = useCashRegister();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      refetchActive();
    }
  }, [isAuthenticated, router, refetchActive]);

  if (!isAuthenticated) return null;

  const activeTheme = user?.veterinaria?.preferencias?.tema || 'default';

  return (
    <div className={`flex h-screen bg-zinc-50 overflow-hidden font-sans theme-${activeTheme}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
