'use client';

import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useDifficultTopics } from '@/lib/hooks/use-teacher';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function DifficultTopicsCard() {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useDifficultTopics(10);

  const topics = data?.topics ?? [];
  const visible = expanded ? topics : topics.slice(0, 3);

  if (isLoading) {
    return <Skeleton className="h-40 rounded-xl" />;
  }

  if (topics.length === 0) {
    return null; // hali statistik ma'lumot yo'q — ko'rsatmaymiz
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Eng ko'p xato qilinayotgan savollar</h3>
        </div>

        <div className="space-y-2">
          {visible.map((t) => (
            <div
              key={t.question_id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-muted)]/50"
            >
              <div
                className={cn(
                  'shrink-0 h-9 w-12 rounded-md flex items-center justify-center text-xs font-bold',
                  t.wrong_rate >= 60
                    ? 'bg-[var(--color-danger)]/15 text-[var(--color-danger)]'
                    : 'bg-amber-500/15 text-amber-600',
                )}
              >
                {t.wrong_rate}%
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.question_text}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                  {t.lesson_title} · {t.quiz_title}
                </p>
              </div>
              <span className="text-xs text-[var(--color-muted-foreground)] shrink-0">
                {t.wrong_count}/{t.total_attempts}
              </span>
            </div>
          ))}
        </div>

        {topics.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            {expanded ? 'Kamroq ko\'rsat' : `Yana ${topics.length - 3} tasini ko'rsat`}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </CardContent>
    </Card>
  );
}