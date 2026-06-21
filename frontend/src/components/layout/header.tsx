'use client';

import Link from 'next/link';
import { Flame, Sparkles, LogOut } from 'lucide-react';

import { useDashboard } from '@/lib/hooks/use-dashboard';
import { useAuthStore } from '@/store/auth';

export function Header() {
  const { user, logout } = useAuthStore();
  const { data, isLoading } = useDashboard();

  const homeHref = user?.role === 'student' ? '/dashboard' : '/teacher/students';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (!user || user.role !== 'student') {
    // Teacher/admin uchun streak kerak emas — oddiy header
    return (
      <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] sticky top-0 z-30">
        <Link href={homeHref} className="md:hidden text-lg font-bold tracking-tight">
          Dio <span className="text-[var(--color-primary)]">English</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {user?.full_name || user?.username}
          </span>
          <button
            onClick={handleLogout}
            aria-label="Chiqish"
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] sticky top-0 z-30">
      {/* Mobile logo */}
      <Link href={homeHref} className="md:hidden text-lg font-bold tracking-tight">
        Dio <span className="text-[var(--color-primary)]">English</span>
      </Link>

      {/* Stats — desktop'da chap, mobile'da o'ng */}
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-muted)]">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold">
            {isLoading ? '—' : (data?.streak.current_streak ?? 0)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-muted)]">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold">
            {isLoading ? '—' : (data?.xp.total_xp ?? 0)}
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            XP
          </span>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Chiqish"
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}