'use client';

import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  CircleCheck,
  Award,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/lib/hooks/use-dashboard';

interface StatProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  detail?: string;
  href?: string;
  color?: string;
}

function Stat({ icon: Icon, label, value, detail, href, color }: StatProps) {
  const content = (
    <Card className="hover:border-[var(--color-primary)] transition-colors h-full">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-2">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: color || 'var(--color-muted)',
              opacity: color ? 0.15 : 1,
            }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: color || 'var(--color-foreground)' }}
            />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          {label}
        </p>
        {detail && (
          <p className="text-xs font-medium text-[var(--color-primary)] mt-2">
            {detail}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function QuickStats() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <Stat
        icon={BookOpen}
        label="So'zlar o'zlashtirilgan"
        value={data?.words_mastered ?? 0}
        detail={
          (data?.words_due_now ?? 0) > 0
            ? `${data?.words_due_now} ta takrorlash kerak`
            : undefined
        }
        href="/vocabulary"
        color="#3b82f6"
      />
      <Stat
        icon={GraduationCap}
        label="Tugatilgan darslar"
        value={data?.lessons_completed ?? 0}
        detail={
          (data?.lessons_in_progress ?? 0) > 0
            ? `${data?.lessons_in_progress} ta davom etmoqda`
            : undefined
        }
        href="/tracks"
        color="#8b5cf6"
      />
      <Stat
        icon={CircleCheck}
        label="O'tilgan testlar"
        value={data?.quizzes_passed ?? 0}
        color="#10b981"
      />
      <Stat
        icon={Award}
        label="Erishilgan badgelar"
        value={`${data?.achievements_earned ?? 0}/${data?.achievements_total ?? 0}`}
        color="#f59e0b"
      />
    </div>
  );
}