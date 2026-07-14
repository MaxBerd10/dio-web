'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { navItemsForRole } from './nav-items';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const visibleItems = navItemsForRole(user.role);
  const homeHref = user.role === 'student' ? '/dashboard' : '/teacher/students';
  const isProfileActive = pathname === '/profile';

  const handleLogout = async () => {
    onClose();
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 hidden bg-black/50 backdrop-blur-sm lg:block"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl',
          'transition-transform duration-300 ease-out',
          'hidden lg:flex',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <Link href={homeHref} onClick={onClose} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl btn-gradient text-sm font-bold">
              D
            </span>
            <span className="min-w-0 text-sm font-bold leading-tight">
              <span className="text-[var(--color-primary)]">Diyora</span>
              <span className="block text-[10px] font-medium text-[var(--color-muted-foreground)]">English</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {item.dividerBefore && (
                  <div className="mx-2 my-3 border-t border-[var(--color-border)]" />
                )}
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-sm'
                      : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                        : 'bg-[var(--color-muted)] group-hover:bg-[var(--color-muted)]/80',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-[var(--color-border)] p-3">
          <Link
            href="/profile"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
              isProfileActive
                ? 'bg-[var(--color-primary-soft)] ring-1 ring-[var(--color-primary)]/20'
                : 'hover:bg-[var(--color-muted)]',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-gradient text-sm font-bold shadow-md">
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user.full_name || user.username}
              </p>
              <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                {user.role === 'student'
                  ? "O'quvchi"
                  : user.role === 'teacher'
                    ? "O'qituvchi"
                    : 'Admin'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-danger)]/8 hover:text-[var(--color-danger)]"
          >
            <LogOut className="h-4 w-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>
    </>
  );
}
