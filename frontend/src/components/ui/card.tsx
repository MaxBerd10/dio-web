import * as React from 'react';
import { cn } from '@/lib/utils';

type DivProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.Ref<HTMLHeadingElement>;
};

type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.Ref<HTMLParagraphElement>;
};

export function Card({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]',
        'shadow-[0_1px_2px_oklch(0.2_0.03_280/0.04),0_4px_16px_oklch(0.2_0.03_280/0.05)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-5 pb-4 lg:p-6 lg:pb-5', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ref, ...props }: HeadingProps) {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-bold tracking-tight text-[var(--color-foreground)] lg:text-xl',
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ref, ...props }: ParagraphProps) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-[var(--color-muted-foreground)] leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('p-5 leading-normal lg:p-6', className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-5 pt-0 lg:p-6 lg:pt-0', className)}
      {...props}
    />
  );
}
