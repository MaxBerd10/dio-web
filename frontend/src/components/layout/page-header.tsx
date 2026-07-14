import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

export function PageHeader({ icon, title, description, badge, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 lg:mb-8 animate-fadeIn', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold leading-snug tracking-tight lg:text-3xl">{title}</h1>
            {badge && (
              <span className="rounded-full bg-[var(--color-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)] lg:text-base">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
