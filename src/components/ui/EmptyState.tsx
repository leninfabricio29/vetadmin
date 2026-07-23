import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No se encontraron registros',
  description = 'Intenta cambiar los filtros de búsqueda o registra un nuevo elemento para empezar.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/30">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 text-zinc-400">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-xs leading-normal">{description}</p>
    </div>
  );
};
