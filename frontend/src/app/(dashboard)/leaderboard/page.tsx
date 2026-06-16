'use client';

import { useState } from 'react';
import { Trophy, Flame } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard } from '@/lib/hooks/use-dashboard';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'all' | 'weekly'>('weekly');
  const { data, isLoading } = useLeaderboard(period);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-7 w-7 text-[var(--color-accent)]" />
          Reyting
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          Eng faol o'quvchilar — kuningizdan eng yaxshisi.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setPeriod('weekly')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            period === 'weekly'
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
              : 'bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]',
          )}
        >
          Hafta
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            period === 'all'
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
              : 'bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]',
          )}
        >
          Hamma vaqt
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !data?.entries.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Hozircha reyting bo'sh.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.entries.map((entry) => {
            const isMe = entry.user_id === user?.id;
            const medal =
              entry.rank === 1
                ? '🥇'
                : entry.rank === 2
                  ? '🥈'
                  : entry.rank === 3
                    ? '🥉'
                    : null;

            return (
              <Card
                key={entry.user_id}
                className={cn(
                  isMe && 'border-[var(--color-primary)] bg-[var(--color-primary)]/5',
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-10 text-center shrink-0">
                    {medal ? (
                      <div className="text-2xl">{medal}</div>
                    ) : (
                      <div className="text-lg font-bold text-[var(--color-muted-foreground)]">
                        {entry.rank}
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] flex items-center justify-center font-semibold shrink-0">
                    {(entry.full_name || entry.username)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* Name & meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base truncate">
                      {entry.full_name || entry.username}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-[var(--color-primary)]">
                          (siz)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                      <span>Lv {entry.level}</span>
                      <span className="flex items-center gap-0.5">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.current_streak}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <div className="font-bold text-[var(--color-primary)]">
                      {entry.xp}
                    </div>
                    <div className="text-[10px] text-[var(--color-muted-foreground)] uppercase">
                      XP
                    </div>
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