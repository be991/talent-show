'use client';

import { InputHTMLAttributes, forwardRef, useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  accept?: string;
  maxSizeMB?: number;
  preview?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      label,
      error,
      helperText,
      accept = 'image/*',
      maxSizeMB = 5,
      preview = true,
      disabled,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate size
        if (file.size > maxSizeMB * 1024 * 1024) {
          // You might want to pass this error up
          return;
        }

        setSelectedFile(file);
        
        if (preview && file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        } else {
          setPreviewUrl(null);
        }

        onChange?.(e);
      }
    };

    const removeFile = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (internalInputRef.current) {
        internalInputRef.current.value = '';
      }
      // Trigger a change event with null? 
      // For now just clearing local state. 
    };

    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div
          className={cn(
            'relative border-2 border-dashed rounded-xl transition-all duration-200 p-4',
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-gold bg-gray-50',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <input
            ref={(e) => {
              // Handle both refs
              (internalInputRef as any).current = e;
              if (typeof ref === 'function') ref(e);
              else if (ref) (ref as any).current = e;
            }}
            type="file"
            accept={accept}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            {...props}
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Upload className="w-6 h-6 text-primary-gold" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Click or drag to upload</p>
                <p className="text-xs text-gray-500">
                  {accept.replace(/\*/g, '').split(',').join(', ')} (Max {maxSizeMB}MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {previewUrl ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {error ? (
          <p className="text-sm text-red-500 font-medium animate-fade-in">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
