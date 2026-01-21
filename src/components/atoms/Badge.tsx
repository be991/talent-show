'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  pill?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot,
  removable,
  onRemove,
  pill = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5 font-medium',
        'transition-colors',
        
        // Variant styles
        {
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'error',
          'bg-blue-100 text-blue-800': variant === 'info',
          'bg-gray-100 text-gray-800': variant === 'default',
        },
        
        // Size styles
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
          'px-3 py-1.5 text-base': size === 'lg',
        },
        
        // Shape
        pill ? 'rounded-full' : 'rounded-md',
        
        className
      )}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            {
              'bg-green-500': variant === 'success',
              'bg-yellow-500': variant === 'warning',
              'bg-red-500': variant === 'error',
              'bg-blue-500': variant === 'info',
              'bg-gray-500': variant === 'default',
            }
          )}
        />
      )}
      
      {/* Icon */}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      
      {/* Content */}
      {children}
      
      {/* Remove button */}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity ml-0.5"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
}
