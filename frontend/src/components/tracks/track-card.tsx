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
};

const TRACK_STYLES: Record<Track['code'], TrackStyle> = {
  general: {
    gradient: 'from-blue-500/10 to-cyan-500/5',
    iconBg: 'bg-blue-500/15',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  cefr: {
    gradient: 'from-violet-500/10 to-purple-500/5',
    iconBg: 'bg-violet-500/15',
    accent: 'text-violet-600 dark:text-violet-400',
  },
  ielts: {
    gradient: 'from-amber-500/10 to-orange-500/5',
    iconBg: 'bg-amber-500/15',
    accent: 'text-amber-600 dark:text-amber-400',
  },
};

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const style = TRACK_STYLES[track.code];

  return (
    <Link href={`/tracks/${track.code}`} className="block group">
      <Card
        className={cn(
          'relative overflow-hidden h-full transition-all duration-200',
          'hover:border-[var(--color-primary)] hover:shadow-lg',
          'group-active:scale-[0.99]',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-100',
            style.gradient,
          )}
        />

        <CardContent className="relative p-6 md:p-7 flex flex-col h-full min-h-[200px]">
          <div
            className={cn(
              'h-14 w-14 rounded-2xl flex items-center justify-center text-3xl mb-4',
              style.iconBg,
            )}
          >
            {track.icon}
          </div>

          <h3 className="text-xl font-bold tracking-tight mb-1.5">
            {track.name}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed flex-1">
            {track.description}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <BookOpen className={cn('h-4 w-4', style.accent)} />
              <span className="font-medium">{track.course_count}</span>
              <span className="text-[var(--color-muted-foreground)]">
                kurs
              </span>
            </div>
            <ArrowRight
              className={cn(
                'h-5 w-5 transition-transform group-hover:translate-x-1',
                style.accent,
              )}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}