import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary: 'btn-gradient',
        accent:
          'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:brightness-105 shadow-md shadow-[var(--color-accent)]/25',
        outline:
          'border-2 border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-muted)]',
        ghost:
          'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-muted)]',
        danger:
          'bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:brightness-105 shadow-md',
        link:
          'bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs rounded-lg',
        md: 'h-12 px-6',
        lg: 'h-14 px-8 text-base rounded-2xl',
        icon: 'h-11 w-11 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    ref?: React.Ref<HTMLButtonElement>;
  };

export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
