import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ className, title, subtitle, children, ...props }) => {
  return (
    <div
      className={twMerge(
        'bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          {title && <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>}
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
