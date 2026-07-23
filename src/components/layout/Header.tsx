'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth.store';
import { Bell, ChevronRight } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, idx) => {
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      const href = '/' + paths.slice(0, idx + 1).join('/');
      const isLast = idx === paths.length - 1;

      return (
        <React.Fragment key={href}>
          {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-400 mx-1 shrink-0" />}
          {isLast ? (
            <span className="text-xs font-semibold text-zinc-800 truncate max-w-[120px] md:max-w-xs">{label}</span>
          ) : (
            <span className="text-xs text-zinc-500 font-medium">{label}</span>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <header className="sticky top-0 right-0 z-30 h-16 w-full border-b border-zinc-100 bg-white flex items-center justify-between px-6 select-none shrink-0">
      <div className="flex items-center gap-1.5 overflow-hidden">
        {getBreadcrumbs()}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors relative cursor-pointer">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-zinc-900 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-zinc-200"></div>

        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-zinc-900">{user.nombres} {user.apellidos}</p>
              <p className="text-[10px] text-zinc-500 font-medium capitalize">{user.rol}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs select-none">
              {user.nombres[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
