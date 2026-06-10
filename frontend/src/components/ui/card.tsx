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
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm',
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
      className={cn('flex flex-col gap-1.5 p-6 pb-4', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ref, ...props }: HeadingProps) {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold tracking-tight text-[var(--color-foreground)]',
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
      className={cn('text-sm text-[var(--color-muted-foreground)]', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ref, ...props }: DivProps) {
  return (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  );
}

export function CardFooter({ className, ref, ...props }: DivProps) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}