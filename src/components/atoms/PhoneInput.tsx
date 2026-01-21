'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './Input';

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, helperText, fullWidth = true, className, onChange, ...props }, ref) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to 11 digits (if starting with 0) or 10 digits
      if (value.startsWith('0')) {
        value = value.slice(0, 11);
      } else {
        value = value.slice(0, 10);
      }
      
      // We don't want to force +234 prefix in the input value itself if it's hard to edit,
      // but we can show it as a decorator or just handle it in the parent.
      // For this implementation, we'll keep the raw digits in the input.
      
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: value,
        },
      };
      
      onChange?.(newEvent as any);
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <Input
          ref={ref}
          type="tel"
          label={label}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          className={cn('pl-20', className)}
          onChange={handlePhoneChange}
          leftIcon={
            <div className="flex items-center space-x-2 border-r border-gray-300 pr-2 mr-2 bg-gray-50 h-full absolute left-0 top-0 rounded-l-lg px-3">
              <span className="text-sm font-semibold text-gray-500">🇳🇬</span>
              <span className="text-sm font-semibold text-gray-700">+234</span>
            </div>
          }
          placeholder="801 234 5678"
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
