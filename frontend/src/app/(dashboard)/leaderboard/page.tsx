'use client';

import { useState } from 'react';
import { Trophy, Flame } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/lib/hooks/use-dashboard';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'all' | 'weekly'>('weekly');
  const { data, isLoading } = useLeaderboard(period);

  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-8 animate-fadeIn">
      <PageHeader
        icon={<Trophy className="h-6 w-6 text-[var(--color-accent)]" />}
        title="Reyting"
        description="Eng faol o'quvchilar — kuningizdan eng yaxshisi."
      />

      <div className="mb-5 flex gap-2 rounded-2xl bg-[var(--color-muted)]/60 p-1">
        {(['weekly', 'all'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
              period === p
                ? 'btn-gradient shadow-md'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
            )}
          >
            {p === 'weekly' ? 'Hafta' : 'Hamma vaqt'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : !data?.entries.length ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">Hozircha reyting bo&apos;sh.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.entries.map((entry) => {
            const isMe = entry.user_id === user?.id;
            const medal = MEDALS[entry.rank];

            return (
              <Card
                key={entry.user_id}
                className={cn(
                  'transition-all',
                  isMe && 'border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)]',
                  entry.rank <= 3 && !isMe && 'border-[var(--color-accent)]/20',
                )}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 shrink-0 text-center">
                    {medal ? (
                      <div className="text-2xl">{medal}</div>
                    ) : (
                      <div className="text-lg font-bold text-[var(--color-muted-foreground)]">{entry.rank}</div>
                    )}
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl btn-gradient text-sm font-bold shadow-md">
                    {(entry.full_name || entry.username).charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm md:text-base">
                      {entry.full_name || entry.username}
                      {isMe && (
                        <span className="ml-1.5 text-xs font-medium text-[var(--color-primary)]">(siz)</span>
                      )}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                      <span>Lv {entry.level}</span>
                      <span className="flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-[var(--color-streak)]" />
                        {entry.current_streak}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="font-bold tabular-nums text-[var(--color-primary)]">{entry.xp}</div>
                    <div className="text-[10px] uppercase text-[var(--color-muted-foreground)]">XP</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
