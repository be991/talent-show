'use client';

import { TextareaHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount,
      maxLength,
      fullWidth = true,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState(props.value || '');
    
    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              // Base styles
              'w-full px-4 py-3 rounded-lg border',
              'text-gray-900 placeholder-gray-400',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2',
              'min-h-[120px] resize-y',
              
              // States
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-gold focus:ring-primary-gold',
              
              disabled && 'bg-gray-100 cursor-not-allowed opacity-50',
              
              className
            )}
            onChange={(e) => {
              setValue(e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />
        </div>
        
        {/* Helper Text / Error / Character Count */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {error && (
              <p className="text-sm text-red-500 font-medium animate-fade-in">{error}</p>
            )}
            {!error && helperText && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
          
          {showCharCount && maxLength && (
            <p className="text-sm text-gray-400">
              {String(value).length}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
