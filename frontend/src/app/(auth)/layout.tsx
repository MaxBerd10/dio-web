import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight inline-flex items-center gap-1"
        >
          Dio
          <span className="text-[var(--color-primary)]">English Tutor</span>
        </Link>
      </header>

      {/* Markaziy maydon */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="p-4 text-center text-xs text-[var(--color-muted-foreground)]">
        © 2026 Dio English Tutor
      </footer>
    </div>
  );
}