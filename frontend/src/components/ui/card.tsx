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
    default: 'bg-[#1A1A24] border border-white/[0.06]',
    highlighted: 'bg-gradient-to-b from-[#3B82F6]/10 to-[#1A1A24] border-2 border-[#3B82F6]/30',
    glass: 'bg-[#1A1A24]/80 backdrop-blur-sm border border-white/[0.10]'
  };

  return (
    <div
      className={cn(
        'rounded-lg p-6 transition-all duration-150',
        hover && 'hover:border-white/[0.10] hover:bg-[#22222E]',
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
        <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/[0.12] flex items-center justify-center text-[#60A5FA]">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-medium text-lg text-[#E8E8ED]">{title}</h3>
        {subtitle && <p className="text-sm text-[#8A8F98]">{subtitle}</p>}
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
