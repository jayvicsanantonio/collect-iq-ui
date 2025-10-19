'use client';

import * as React from 'react';
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPLOAD_CONFIG } from '@/lib/upload-config';
import { validateUploadFileSync } from '@/lib/upload-validators';

// ============================================================================
// Types
// ============================================================================

export interface UploadError {
  type: 'file-type' | 'file-size' | 'unknown';
  message: string;
  file?: File;
}

export interface UploadDropzoneProps {
  onSelected: (files: File[]) => void;
  onError: (error: UploadError) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Validation State
// ============================================================================

type ValidationState = 'idle' | 'valid' | 'invalid';

interface DragValidation {
  state: ValidationState;
  error?: string;
}

// ============================================================================
// Component
// ============================================================================

export function UploadDropzone({
  onSelected,
  onError,
  disabled = false,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragValidation, setDragValidation] =
    React.useState<DragValidation>({
      state: 'idle',
    });
  const [inlineError, setInlineError] = React.useState<string | null>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragCounterRef = React.useRef(0);

  // ============================================================================
  // File Handling
  // ============================================================================

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Clear any previous inline errors
      setInlineError(null);

      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      // Validate each file
      for (const file of fileArray) {
        const result = validateUploadFileSync(file);
        if (!result.valid) {
          const error: UploadError = {
            type: result.error?.includes('too large')
              ? 'file-size'
              : 'file-type',
            message: result.error || 'Invalid file',
            file,
          };
          setInlineError(result.error || 'Invalid file');
          onError(error);
          return; // Stop on first error
        }
        validFiles.push(file);
      }

      // All files valid
      if (validFiles.length > 0) {
        onSelected(validFiles);
      }
    },
    [onSelected, onError]
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleClick = React.useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
      // Reset input so same file can be selected again
      event.target.value = '';
    },
    [handleFiles]
  );

  const handleDragEnter = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) return;

      dragCounterRef.current += 1;
      if (
        event.dataTransfer.items &&
        event.dataTransfer.items.length > 0
      ) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) return;

      dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
        setDragValidation({ state: 'idle' });
      }
    },
    [disabled]
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) return;

      setIsDragging(false);
      setDragValidation({ state: 'idle' });
      dragCounterRef.current = 0;

      const files = event.dataTransfer.files;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  // ============================================================================
  // Keyboard Accessibility
  // ============================================================================

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [disabled, handleClick]
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload card image. Supports JPG, PNG, HEIC. Maximum 12 MB. Best results with 2000 to 4000 pixel images."
      aria-disabled={disabled}
      aria-invalid={inlineError ? 'true' : 'false'}
      aria-describedby={inlineError ? 'upload-error' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all',
        'min-h-[280px] cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--holo-cyan)] focus-visible:ring-offset-2',
        dragValidation.state === 'invalid' && isDragging && !disabled
          ? 'border-[var(--destructive)] bg-[var(--destructive)]/10 animate-shake'
          : dragValidation.state === 'valid' &&
            isDragging &&
            !disabled
          ? 'border-[var(--holo-cyan)] bg-[var(--holo-cyan)]/10 scale-[1.02]'
          : isDragging && !disabled
          ? 'border-[var(--holo-cyan)] bg-[var(--holo-cyan)]/10 scale-[1.02]'
          : 'border-[var(--border)] hover:border-[var(--vault-blue)] hover:bg-[var(--muted)]/50',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_CONFIG.supportedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={cn(
          'mb-4 rounded-full p-4 transition-colors',
          dragValidation.state === 'invalid' && isDragging
            ? 'bg-[var(--destructive)]/20'
            : dragValidation.state === 'valid' && isDragging
            ? 'bg-[var(--holo-cyan)]/20'
            : isDragging && !disabled
            ? 'bg-[var(--holo-cyan)]/20'
            : 'bg-[var(--muted)]'
        )}
      >
        {dragValidation.state === 'invalid' && isDragging ? (
          <AlertCircle
            className="h-8 w-8 text-[var(--destructive)]"
            aria-hidden="true"
          />
        ) : isDragging ? (
          <ImageIcon
            className="h-8 w-8 text-[var(--holo-cyan)]"
            aria-hidden="true"
          />
        ) : (
          <Upload
            className="h-8 w-8 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="mb-2 text-base font-medium text-[var(--foreground)]">
          {dragValidation.state === 'invalid' && isDragging
            ? 'Invalid file'
            : isDragging
            ? 'Drop your image here'
            : 'Drag and drop your card image'}
        </p>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          {dragValidation.state === 'invalid' && isDragging
            ? dragValidation.error
            : 'or click to browse'}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          JPG, PNG, or HEIC • Up to {UPLOAD_CONFIG.maxSizeMB} MB
        </p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]/70">
          Best results: 2000–4000 px
        </p>
      </div>

      {/* Inline error message */}
      {inlineError && !isDragging && (
        <div
          id="upload-error"
          className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--destructive)]/10 px-4 py-2 text-sm text-[var(--destructive)]"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle
            className="h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{inlineError}</span>
        </div>
      )}

      {/* Mobile hint */}
      <div className="mt-4 text-xs text-[var(--muted-foreground)] sm:hidden">
        Tap to upload from your device
      </div>
    </div>
  );
}
