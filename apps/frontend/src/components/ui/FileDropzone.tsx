'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useTranslation } from '@/contexts/I18nContext';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx'],
  maxSize = 10,
  disabled = false,
  isUploading = false,
  uploadProgress = 0,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return t('admin.upload.file_too_large', { maxSize });
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return t('admin.upload.invalid_file_type', { types: acceptedTypes.join(', ') });
    }

    return null;
  }, [maxSize, acceptedTypes, t]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  return (
    <div className={`relative ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative overflow-hidden border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragOver && !disabled && !isUploading 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50'
          }
        `}
      >
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
            <div className="w-16 h-16 mb-4">
              <svg className="w-full h-full animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              {t('admin.upload.uploading')}
            </div>
            {uploadProgress > 0 && (
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Upload Icon */}
        <div className="mb-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Upload Text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isDragOver 
              ? t('admin.upload.drop_file_here')
              : t('admin.upload.drag_drop_or_click')
            }
          </p>
          <p className="text-sm text-gray-500">
            {t('admin.upload.supported_formats')}: {acceptedTypes.join(', ')}
          </p>
          <p className="text-xs text-gray-400">
            {t('admin.upload.max_size', { size: maxSize })}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
