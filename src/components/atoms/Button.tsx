'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean; // Added for compatibility
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isActuallyLoading = loading || isLoading;

    return (
      <button
        ref={ref}
        disabled={disabled || isActuallyLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-semibold rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          
          // Variant styles
          {
            // Primary (Gold)
            'bg-primary-gold text-white hover:bg-primary-gold/90 focus:ring-primary-gold':
              variant === 'primary',
            
            // Secondary (Green)
            'bg-primary-green text-white hover:bg-primary-green/90 focus:ring-primary-green':
              variant === 'secondary',
            
            // Outline
            'border-2 border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-white':
              variant === 'outline',
            
            // Ghost
            'text-primary-gold hover:bg-primary-gold/10':
              variant === 'ghost',
            
            // Link
            'text-primary-gold underline-offset-4 hover:underline':
              variant === 'link',
          },
          
          // Size styles
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          
          // Full width
          fullWidth && 'w-full',
          
          // Custom className
          className
        )}
        {...props}
      >
        {isActuallyLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!isActuallyLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!isActuallyLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
