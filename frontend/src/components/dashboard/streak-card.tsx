'use client';

import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/lib/hooks/use-dashboard';

export function StreakCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  const streak = data?.streak;
  const current = streak?.current_streak ?? 0;
  const longest = streak?.longest_streak ?? 0;

  return (
    <Card className="overflow-hidden relative">
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10"
        style={{ backgroundColor: '#f97316' }}
      />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
              Joriy streak
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">
                {current}
              </span>
              <span className="text-sm text-[var(--color-muted-foreground)]">
                kun
              </span>
            </div>
            {longest > 0 && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                Eng uzun: <span className="font-semibold">{longest} kun</span>
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}