'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { NAV_ITEMS } from './nav-items';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.forRoles || item.forRoles.includes(user.role),
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-[var(--color-border)]">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          English with <span className="text-[var(--color-primary)]">Diyora</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {item.dividerBefore && (
                <div className="my-2 border-t border-[var(--color-border)]" />
              )}
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-0.5',
                  isActive
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-muted)]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User va logout */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--color-muted)] transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center text-sm font-semibold">
            {(user.full_name || user.username).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {user.full_name || user.username}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
}