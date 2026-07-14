'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { primaryMobileNav, moreMobileNav } from './nav-items';

interface MobileNavProps {
  onOpenMore: () => void;
  moreOpen: boolean;
}

export function MobileNav({ onOpenMore, moreOpen }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const primaryItems = primaryMobileNav(user.role);
  const hasMore = moreMobileNav(user.role).length > 0;
  const isMoreActive = moreMobileNav(user.role).some(
    (item) => pathname === item.href || pathname?.startsWith(item.href + '/'),
  );

  return (
    <nav
      className="lg:hidden fixed bottom-3 left-3 right-3 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Asosiy navigatsiya"
    >
      <div className="glass-card flex items-stretch justify-around min-h-[var(--mobile-nav-height)] px-1 rounded-2xl shadow-xl">
        {primaryItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-all',
                'active:scale-90',
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]',
              )}
            >
              {isActive && (
                <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-[var(--color-primary)]" />
              )}
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                  isActive && 'bg-[var(--color-primary-soft)] scale-105',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="text-[10px] font-semibold leading-tight truncate max-w-full px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        {hasMore && (
          <button
            type="button"
            onClick={onOpenMore}
            aria-expanded={moreOpen}
            aria-label="Yana"
            className={cn(
              'relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-w-0 transition-all active:scale-90',
              moreOpen || isMoreActive
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)]',
            )}
          >
            {(moreOpen || isMoreActive) && (
              <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-[var(--color-primary)]" />
            )}
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                (moreOpen || isMoreActive) && 'bg-[var(--color-primary-soft)] scale-105',
              )}
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={moreOpen || isMoreActive ? 2.5 : 2} />
            </span>
            <span className="text-[10px] font-semibold leading-tight">Yana</span>
          </button>
        )}
      </div>
    </nav>
  );
}
