import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data...',
  size = 'md',
  fullHeight = false,
}) => {
  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${
        fullHeight ? 'min-h-[350px] h-full' : 'py-10'
      }`}
    >
      <Loader2 className={`${sizeClass} animate-spin text-indigo-600`} />
      {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
    </div>
  );
};
