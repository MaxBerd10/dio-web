'use client';

import Link from 'next/link';
import { Trophy, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/lib/hooks/use-dashboard';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const RANK_STYLES: Record<number, string> = {
  1: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md',
  2: 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-zinc-800',
  3: 'bg-gradient-to-br from-orange-400 to-orange-500 text-white',
};

export function LeaderboardPreview() {
  const { user } = useAuthStore();
  const { data, isLoading } = useLeaderboard('weekly');

  const top5 = data?.entries.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
            <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
          </span>
          <CardTitle className="text-base">Haftalik reyting</CardTitle>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          Hammasi <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)
        ) : top5.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Hozircha reyting bo&apos;sh
          </p>
        ) : (
          top5.map((entry) => {
            const isMe = entry.user_id === user?.id;
            return (
              <div
                key={entry.user_id}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-2.5 transition-colors',
                  isMe
                    ? 'bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/15'
                    : 'hover:bg-[var(--color-muted)]/50',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                    RANK_STYLES[entry.rank] ?? 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {entry.full_name || entry.username}
                    {isMe && (
                      <span className="ml-1.5 text-xs font-medium text-[var(--color-primary)]">
                        (siz)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Lv {entry.level} · 🔥 {entry.current_streak}
                  </p>
                </div>
                <div className="text-sm font-bold tabular-nums text-[var(--color-primary)]">
                  {entry.xp} XP
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
