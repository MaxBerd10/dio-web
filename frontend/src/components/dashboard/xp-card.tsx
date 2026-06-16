'use client';

import { Sparkles, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/lib/hooks/use-dashboard';

export function XPCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  const xp = data?.xp;
  const level = xp?.level ?? 1;
  const totalXp = xp?.total_xp ?? 0;
  const progress = xp?.progress_to_next_level ?? 0;

  return (
    <Card className="overflow-hidden relative">
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
              Daraja
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">
                {level}
              </span>
              <span className="text-sm text-[var(--color-muted-foreground)]">
                lv
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--color-muted-foreground)]">
              Keyingi daraja
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} size="sm" />
          <div className="flex items-center gap-1 mt-2">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <span className="text-sm font-semibold">{totalXp}</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              XP jami
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}