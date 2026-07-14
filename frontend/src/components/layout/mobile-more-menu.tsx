'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { moreMobileNav } from './nav-items';

interface MobileMoreMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMoreMenu({ open, onClose }: MobileMoreMenuProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user || !open) return null;

  const items = moreMobileNav(user.role);
  const isProfileActive = pathname === '/profile';

  const handleLogout = async () => {
    onClose();
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <button
        type="button"
        aria-label="Yopish"
        className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 bottom-0 z-[70]',
          'glass-card rounded-t-3xl border-t-0',
          'pb-[calc(1rem+env(safe-area-inset-bottom))]',
          'animate-slideUp',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Qo'shimcha bo'limlar"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <h2 className="text-lg font-bold">Boshqa bo&apos;limlar</h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">Testlar, grammar, reyting...</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-muted)] active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Link
          href="/profile"
          onClick={onClose}
          className={cn(
            'mx-3 mb-3 flex items-center gap-3 rounded-2xl p-3 transition-all active:scale-[0.98]',
            isProfileActive
              ? 'bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20'
              : 'bg-[var(--color-muted)]/50',
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl btn-gradient text-sm font-bold shadow-md">
            {(user.full_name || user.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user.full_name || user.username}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {user.role === 'student' ? "O'quvchi · Profil" : user.role === 'teacher' ? "O'qituvchi · Profil" : 'Admin · Profil'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
        </Link>

        <nav className="grid max-h-[50dvh] grid-cols-2 gap-2 overflow-y-auto px-3 pb-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all active:scale-95',
                  isActive
                    ? 'border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'bg-[var(--color-muted)]/50 text-[var(--color-foreground)]',
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-danger)]/8 py-3.5 text-sm font-semibold text-[var(--color-danger)] active:scale-[0.98]"
          >
            <LogOut className="h-5 w-5" />
            Chiqish
          </button>
        </div>
      </div>
    </>
  );
}
