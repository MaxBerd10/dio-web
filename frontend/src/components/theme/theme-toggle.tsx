'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPreferredTheme, subscribeTheme, toggleTheme } from '@/lib/theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribeTheme, getPreferredTheme, () => 'light');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Kunduzgi rejimga o\'tish' : 'Tungi rejimga o\'tish'}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
        'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-[var(--color-accent)]" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
