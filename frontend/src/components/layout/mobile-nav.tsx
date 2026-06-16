'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { NAV_ITEMS } from './nav-items';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      item.mobileShow && (!item.forRoles || item.forRoles.includes(user.role)),
  ).slice(0, 5); // max 5 ta — telefon ekrani uchun

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] backdrop-blur-md">
      <div className="flex items-stretch justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}