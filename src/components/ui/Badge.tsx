import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold select-none border',
          {
            'bg-green-50 text-green-700 border-green-200': variant === 'success',
            'bg-amber-50 text-amber-700 border-amber-200': variant === 'warning',
            'bg-red-50 text-red-700 border-red-200': variant === 'danger',
            'bg-sky-50 text-sky-700 border-sky-200': variant === 'info',
            'bg-zinc-100 text-zinc-700 border-zinc-200': variant === 'neutral',
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
