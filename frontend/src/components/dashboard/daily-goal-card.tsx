'use client';

import { Target, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/lib/hooks/use-dashboard';

export function DailyGoalCard() {
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

  const dailyXp = data?.xp.daily_xp ?? 0;
  const goal = data?.daily_goal_xp ?? 30;
  const met = data?.daily_goal_met ?? false;
  const progress = Math.min(100, Math.round((dailyXp / goal) * 100));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
              Kunlik maqsad
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {dailyXp}
              </span>
              <span className="text-sm text-[var(--color-muted-foreground)]">
                / {goal} XP
              </span>
            </div>
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              met
                ? 'bg-green-100 dark:bg-green-950/30'
                : 'bg-[var(--color-muted)]'
            }`}
          >
            {met ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Target className="h-5 w-5 text-[var(--color-muted-foreground)]" />
            )}
          </div>
        </div>
        <Progress
          value={progress}
          color={met ? '#22c55e' : 'var(--color-primary)'}
          size="md"
        />
        {met && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
            🎉 Bugungi maqsad bajarildi!
          </p>
        )}
      </CardContent>
    </Card>
  );
}