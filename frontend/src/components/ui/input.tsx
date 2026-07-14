import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({
  className,
  type = 'text',
  label,
  error,
  hint,
  id,
  ref,
  ...props
}: InputProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {props.required && (
            <span className="text-[var(--color-danger)] ml-0.5">*</span>
          )}
        </Label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        aria-invalid={hasError}
        aria-describedby={
          hasError
            ? `${inputId}-error`
            : hint
              ? `${inputId}-hint`
              : undefined
        }
        className={cn(
          'flex h-12 w-full rounded-xl border-2 bg-[var(--color-input)] px-4 py-2 text-base',
          'placeholder:text-[var(--color-muted-foreground)]/70',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]'
            : 'border-[var(--color-border)]',
          className,
        )}
        {...props}
      />
      {hint && !hasError && (
        <p
          id={`${inputId}-hint`}
          className="text-xs text-[var(--color-muted-foreground)]"
        >
          {hint}
        </p>
      )}
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}