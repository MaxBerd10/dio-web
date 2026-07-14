import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  ref?: React.Ref<HTMLSelectElement>;
};

export function Select({
  className,
  label,
  error,
  hint,
  options,
  placeholder,
  id,
  ref,
  ...props
}: SelectProps) {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <Label htmlFor={selectId}>
          {label}
          {props.required && (
            <span className="text-[var(--color-danger)] ml-0.5">*</span>
          )}
        </Label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 bg-[var(--color-input)] px-4 py-2 text-base appearance-none',
          'bg-[image:var(--chevron-icon)] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem] pr-9',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]'
            : 'border-[var(--color-border)]',
          className,
        )}
        style={{
          ['--chevron-icon' as never]:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23999\' stroke-width=\'2\'%3E%3Cpath d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !hasError && (
        <p className="text-xs text-[var(--color-muted-foreground)]">{hint}</p>
      )}
      {hasError && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}