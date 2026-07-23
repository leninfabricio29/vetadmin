import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Ocurrió un error al cargar los datos',
  description = 'No pudimos conectar con el servidor. Por favor, inténtalo de nuevo.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-red-200/55 rounded-xl bg-red-50/10">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-150 text-red-700">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-xs leading-normal">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Reintentar cargar
        </Button>
      )}
    </div>
  );
};
