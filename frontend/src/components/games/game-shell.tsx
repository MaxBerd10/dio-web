import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GameIdleProps {
  emoji: string;
  title: string;
  description: string;
  onStart: () => void;
  loading?: boolean;
  startLabel?: string;
  startIcon?: ReactNode;
}

export function GameIdleScreen({
  emoji,
  title,
  description,
  onStart,
  loading,
  startLabel = 'Boshlash',
  startIcon,
}: GameIdleProps) {
  return (
    <div className="mx-auto max-w-xl p-4 lg:p-8 animate-fadeIn">
      <Link
        href="/games"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        O&apos;yinlar
      </Link>
      <Card className="overflow-hidden border-[var(--color-primary)]/10">
        <CardContent className="p-8 text-center">
          <div className="mb-4 text-6xl">{emoji}</div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
          <p className="mb-6 text-[var(--color-muted-foreground)]">{description}</p>
          <Button size="lg" onClick={onStart} loading={loading}>
            {startIcon}
            {loading ? 'Yuklanmoqda...' : startLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface GameResultProps {
  emoji: string;
  title: string;
  subtitle?: ReactNode;
  xpEarned?: number;
  extra?: ReactNode;
  onPlayAgain: () => void;
  loading?: boolean;
}

export function GameResultScreen({
  emoji,
  title,
  subtitle,
  xpEarned,
  extra,
  onPlayAgain,
  loading,
}: GameResultProps) {
  return (
    <div className="mx-auto max-w-xl p-4 lg:p-8 animate-fadeIn">
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="mb-4 text-6xl">{emoji}</div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
          {subtitle && (
            <div className="mb-4 text-sm text-[var(--color-muted-foreground)]">{subtitle}</div>
          )}
          {xpEarned !== undefined && xpEarned > 0 && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-[var(--color-accent)]">
              <span className="font-bold">+{xpEarned} XP</span>
            </div>
          )}
          {extra}
          <Button size="lg" onClick={onPlayAgain} loading={loading} className="mt-4">
            Yana o&apos;ynash
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function GamePlayingShell({
  children,
  backHref = '/games',
}: {
  children: ReactNode;
  backHref?: string;
}) {
  return (
    <div className="mx-auto max-w-xl p-4 lg:p-8 animate-fadeIn">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Chiqish
      </Link>
      {children}
    </div>
  );
}
