'use client';

import Link from 'next/link';
import { ChevronRight, Trophy } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAchievements, useDashboard } from '@/lib/hooks/use-dashboard';
import { cn } from '@/lib/utils';

const PREVIEW_COUNT = 8;

export function AchievementsPreview() {
  const { data: dashboard } = useDashboard();
  const { data: achievements, isLoading } = useAchievements();

  const earned =
    dashboard?.achievements_earned ??
    achievements?.filter((a) => a.is_earned).length ??
    0;
  const total = dashboard?.achievements_total ?? achievements?.length ?? 0;
  const preview = (achievements ?? []).slice(0, PREVIEW_COUNT);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]">
              <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
            </span>
            Yutuqlar
          </h3>
          <Link
            href="/achievements"
            className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-primary)]"
          >
            Hammasi <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
              <Skeleton key={i} className="mx-auto h-12 w-12 rounded-2xl" />
            ))}
          </div>
        ) : preview.length === 0 ? (
          <p className="py-6 text-center text-xs text-[var(--color-muted-foreground)]">
            Hali yutuqlar mavjud emas
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {preview.map((item) => (
              <div
                key={item.id}
                title={item.title}
                className={cn(
                  'mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-transform',
                  item.is_earned
                    ? 'bg-gradient-to-br from-[var(--color-accent-soft)] to-[var(--color-primary-soft)] scale-105'
                    : 'bg-[var(--color-muted)] opacity-35 grayscale',
                )}
              >
                {item.icon}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-[var(--color-muted-foreground)]">
          <span className="font-bold text-[var(--color-foreground)]">{earned}</span>
          {total > 0 ? ` / ${total}` : ''} yutuq olindi
        </p>
      </CardContent>
    </Card>
  );
}
