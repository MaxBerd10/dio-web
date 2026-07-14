import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="auth-shell flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <div className="glass-card max-w-md rounded-3xl p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-muted)]">
          <WifiOff className="h-7 w-7 text-[var(--color-muted-foreground)]" />
        </div>
        <h1 className="text-xl font-bold">Internet yo&apos;q</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Ulanish tiklanguncha ba&apos;zi sahifalar ishlamasligi mumkin.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>Qayta urinish</Button>
        </Link>
      </div>
    </div>
  );
}
