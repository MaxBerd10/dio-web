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

export function LeaderboardPreview() {
  const { user } = useAuthStore();
  const { data, isLoading } = useLeaderboard('weekly');

  const top5 = data?.entries.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
          <CardTitle className="text-base">Haftalik reyting</CardTitle>
        </div>
        <Link
          href="/leaderboard"
          className="text-xs text-[var(--color-primary)] flex items-center gap-0.5 hover:underline"
        >
          Hammasi <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)
        ) : top5.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)] py-4 text-center">
            Hozircha reyting bo'sh
          </p>
        ) : (
          top5.map((entry) => {
            const isMe = entry.user_id === user?.id;
            return (
              <div
                key={entry.user_id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg',
                  isMe && 'bg-[var(--color-primary)]/10',
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                    entry.rank === 1
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400'
                      : entry.rank === 2
                        ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        : entry.rank === 3
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                          : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.full_name || entry.username}
                    {isMe && (
                      <span className="ml-1.5 text-xs text-[var(--color-primary)]">
                        (siz)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Lv {entry.level} · 🔥 {entry.current_streak}
                  </p>
                </div>
                <div className="text-sm font-bold text-[var(--color-primary)]">
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