'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Track } from '@/lib/api/content';

type TrackStyle = {
  gradient: string;
  iconBg: string;
  accent: string;
  border: string;
};

const TRACK_STYLES: Record<Track['code'], TrackStyle> = {
  general: {
    gradient: 'from-blue-500/15 via-cyan-500/5 to-transparent',
    iconBg: 'bg-blue-500/15 text-blue-600',
    accent: 'text-blue-600',
    border: 'hover:border-blue-500/30',
  },
  cefr: {
    gradient: 'from-violet-500/15 via-purple-500/5 to-transparent',
    iconBg: 'bg-violet-500/15 text-violet-600',
    accent: 'text-violet-600',
    border: 'hover:border-violet-500/30',
  },
  ielts: {
    gradient: 'from-amber-500/15 via-orange-500/5 to-transparent',
    iconBg: 'bg-amber-500/15 text-amber-600',
    accent: 'text-amber-600',
    border: 'hover:border-amber-500/30',
  },
};

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const style = TRACK_STYLES[track.code];

  return (
    <Link href={`/tracks/${track.code}`} className="group block active:scale-[0.98] transition-transform">
      <Card
        className={cn(
          'relative h-full overflow-hidden transition-all duration-200 hover:shadow-lg',
          style.border,
        )}
      >
        <div className={cn('absolute inset-0 bg-gradient-to-br', style.gradient)} />

        <CardContent className="relative flex min-h-[220px] flex-col p-6 lg:p-7">
          <div
            className={cn(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm',
              style.iconBg,
            )}
          >
            {track.icon}
          </div>

          <h3 className="mb-1.5 text-xl font-bold tracking-tight">{track.name}</h3>
          <p className="flex-1 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {track.description}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <BookOpen className={cn('h-4 w-4', style.accent)} />
              <span className="font-bold">{track.course_count}</span>
              <span className="text-[var(--color-muted-foreground)]">kurs</span>
            </div>
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-muted)]/60 transition-all group-hover:bg-[var(--color-primary-soft)]',
                style.accent,
              )}
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
