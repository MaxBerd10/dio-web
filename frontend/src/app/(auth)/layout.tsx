import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell flex min-h-dvh flex-col">
      <header className="flex items-start justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2 lg:p-6">
        <Link href="/" className="inline-flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl btn-gradient text-base font-bold shadow-lg">
            D
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--color-muted-foreground)]">Xush kelibsiz</p>
            <p className="text-lg font-bold tracking-tight">
              English with <span className="text-[var(--color-primary)]">Diyora</span>
            </p>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col justify-center px-4 pb-6 lg:p-6">
        <div className="mx-auto w-full max-w-md animate-fadeIn">{children}</div>
      </main>

      <footer className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-[var(--color-muted-foreground)]">
        © 2026 English with Diyora · Ingliz tilini oson o&apos;rganing
      </footer>
    </div>
  );
}
