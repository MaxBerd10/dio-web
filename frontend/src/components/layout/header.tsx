'use client';

import Link from 'next/link';
import { Flame, Sparkles, LogOut, Menu, X } from 'lucide-react';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/lib/hooks/use-dashboard';
import { useAuthStore } from '@/store/auth';

interface HeaderProps {
  onMenuClick?: () => void;
  menuOpen?: boolean;
}

export function Header({ onMenuClick, menuOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { data, isLoading } = useDashboard();

  const homeHref = user?.role === 'student' ? '/dashboard' : '/teacher/students';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (!user) return null;

  const isStudent = user.role === 'student';

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--color-border)]">
      <div className="mx-auto flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-6">
        {/* Mobil logo */}
        <Link href={homeHref} className="flex min-w-0 items-center gap-2.5 lg:hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl btn-gradient text-xs font-bold">
            D
          </span>
          <span className="font-bold tracking-tight text-[var(--color-primary)]">Diyora</span>
        </Link>

        {/* Desktop burger + logo */}
        <div className="hidden min-w-0 items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={menuOpen}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
              menuOpen
                ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                : 'bg-[var(--color-muted)]/60 text-[var(--color-foreground)] hover:bg-[var(--color-muted)]',
            )}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href={homeHref} className="flex min-w-0 items-center gap-2 font-bold tracking-tight">
            <span className="text-[var(--color-primary)]">Diyora</span>
            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">English</span>
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {isStudent && (
            <>
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-streak)]/20 bg-[var(--color-streak)]/12 px-2.5 py-1.5 sm:px-3">
                <Flame className="h-4 w-4 shrink-0 text-[var(--color-streak)]" />
                <span className="text-sm font-bold tabular-nums text-[var(--color-streak)]">
                  {isLoading ? '—' : (data?.streak?.current_streak ?? 0)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/15 bg-[var(--color-primary-soft)] px-2.5 py-1.5 sm:px-3">
                <Sparkles className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <span className="text-sm font-bold tabular-nums text-[var(--color-primary)]">
                  {isLoading ? '—' : (data?.xp?.total_xp ?? 0)}
                </span>
              </div>
            </>
          )}

          <ThemeToggle />

          <button
            onClick={handleLogout}
            aria-label="Chiqish"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
