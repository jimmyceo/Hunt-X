'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'glass';
  hover?: boolean;
}

export function Card({ children, className, variant = 'default', hover = true }: CardProps) {
  const variants = {
    default: 'bg-white border border-[#e5edf5]',
    highlighted: 'bg-gradient-to-b from-[#533afd]/10 to-white border-2 border-[#533afd]/30',
    glass: 'bg-white/80 backdrop-blur-sm border border-[#e5edf5]/80'
  };

  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(23,23,23,0.08)]',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-4">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-[#f6f9fc] flex items-center justify-center text-[#64748d]">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-normal text-lg text-[#061b31]">{title}</h3>
        {subtitle && <p className="text-sm text-[#64748d]">{subtitle}</p>}
      </div>
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
