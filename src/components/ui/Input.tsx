import React, { useId } from 'react';
import { clsx } from 'clsx';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className,
  ...props
}: InputProps) {
  const uid = useId();
  const inputId = `input-${uid}`;
  const errorId = `error-${uid}`;
  const hintId  = `hint-${uid}`;

  const describedBy = [
    error && errorId,
    hint  && hintId,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-label text-text-primary">
          {label}
          {props.required && (
            <span className="text-danger ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span
            className="absolute left-3 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          {...props}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className={clsx(
            'input',
            leftIcon  && 'pl-10',
            rightIcon && 'pr-10',
            error     && 'input-error',
            className
          )}
        />

        {rightIcon && (
          <span
            className="absolute right-3 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-label text-danger">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-caption text-text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Textarea variant with the same visual style */
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  fullWidth = true,
  className,
  ...props
}: TextareaProps) {
  const uid = useId();
  const inputId = `textarea-${uid}`;
  const errorId = `textarea-error-${uid}`;

  return (
    <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-label text-text-primary">
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={inputId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        className={clsx(
          'input resize-y min-h-[120px]',
          error && 'input-error',
          className
        )}
      />
      {error && (
        <p id={errorId} role="alert" className="text-label text-danger">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-caption text-text-tertiary">{hint}</p>
      )}
    </div>
  );
}
